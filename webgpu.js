const triangleBufferLayout = (offset, shaderLocation) => ({
    arrayStride: 12,
    attributes: [{
      format: "float32x3",
      offset: offset ?? 0,
      shaderLocation: shaderLocation ?? 0,
    }],
});

const makeCube = () => {
    const geometry = new Float32Array([
        // back plane
        -0.8, +0.8, +1.6,
        +0.8, +0.8, +1.6,
        -0.8, -0.8, +1.6,
    
        +0.8, +0.8, +1.6,
        -0.8, -0.8, +1.6,
        +0.8, -0.8, +1.6,
    
        // front plane
        -0.8, +0.8, +0.8,
        +0.8, +0.8, +0.8,
        -0.8, -0.8, +0.8,
    
        +0.8, +0.8, +0.8,
        -0.8, -0.8, +0.8,
        +0.8, -0.8, +0.8,
    
        // left side
        -0.8, +0.8, +0.8,
        -0.8, -0.8, +0.8,
        -0.8, -0.8, +1.6,
        
        -0.8, +0.8, +0.8,
        -0.8, -0.8, +1.6,
        -0.8, -0.8, +1.6,
    
        // right side
        +0.8, +0.8, +0.8,
        +0.8, -0.8, +0.8,
        +0.8, -0.8, +1.6,
        
        +0.8, +0.8, +0.8,
        +0.8, -0.8, +1.6,
        +0.8, -0.8, +1.6,
    
        // top
        +0.8, +0.8, +0.8,
        -0.8, +0.8, +0.8,
        -0.8, +0.8, +1.6,
        
        +0.8, +0.8, +0.8,
        -0.8, +0.8, +1.6,
        +0.8, +0.8, +1.6,
    ]);

    const bufferLayout = triangleBufferLayout();

    return { geometry, bufferLayout };
}

const makeTriangle = () => {
    const geometry = new Float32Array([
        +0.0, +0.5, -1.0,
        +0.5, -0.5, +0.0,
        -0.5, -0.5, +1.0,
    ]);

    const bufferLayout = triangleBufferLayout();
    return { geometry, bufferLayout };
};

const initCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.style.width = '512px';
    canvas.style.height = '512px';
    canvas.style.position = 'absolute';
    canvas.style.left = '5rem';
    canvas.style.top = '10rem';
    canvas.width = 1024;
    canvas.height = 1024;
    document.body.appendChild(canvas)
    return canvas;
}

const makeError = (msg) => ({ success: false, errorMessage: msg });
const makeSuccess = (value) => ({ success: true, value });
const successful = maybe => maybe.success;
const unwrap = maybe => maybe.value;

const initWebGpu = async () => {
    if (!navigator.gpu) return makeError('navigator.gpu not supported');

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return makeError('no gpu adapter found');

    const device = await adapter.requestDevice();
    if (!device) return makeError('no device found');

    const canvas = initCanvas();
    const context = canvas.getContext("webgpu");
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
    device: device,
    format: canvasFormat,
    });

    const encoder = device.createCommandEncoder();

    return makeSuccess({ canvas, adapter, device, context, encoder, canvasFormat })
}

const makeRenderPipeline = (gpu, objectToDraw) => {
    const { device, canvasFormat } = gpu;
    const { bufferLayout } = objectToDraw;
    const myShaderModule = device.createShaderModule({
        label: 'my shader module',
        code: `

            struct VertexUniforms {
                worldViewProjection: mat4x4f,
                worldInverseTranspose: mat4x4,
            }

            struct VertexIn {
                @location(0) position: vec4f,
                @location(1) normal: vec3f,
                @location(2) texcoord: vec2f,
            }

            struct VertexOut {
                @builtin(position) position: vec4f,
                @location(0) normal: vec3f,
                @location(1) texcoord: vec2f,
            };

            @group(0) binding(0) var<uniform> vsUniforms: VertexUniforms;

            @vertex
            fn vertexMain(vsIn: VertexIn) -> VertexOut {
                var vsOut: VertexOut;

                vsOut.position = vsUniforms * vsIn.position;
                vsOut.normal = vsUniforms.worldInverseTranspose * vec4f(vsIn.normal, 0.0);
                vsOut.texcoord = vsIn.texcoord;

                return vsOut;
            }

            @fragment
            fn fragmentMain(fsIn: VertexOut) -> @location(0) vec4f {
                let zDepth = fsIn.pos.z * 0.5 + 0.5;
                let a_normal = normalize(fsIn.normal);

                return vec4f(a_normal.x, a_normal.y, a_normal.z, 1);
            }
        `,
    });

    const myPipeline = device.createRenderPipeline({
        label: 'my pipeline',
        layout: 'auto',
        vertex: {
            module: myShaderModule,
            entryPoint: 'vertexMain',
            buffers: [bufferLayout],
        },
        fragment: {
            module: myShaderModule,
            entryPoint: 'fragmentMain',
            targets: [{
                format: canvasFormat,
            }]
        }
    });

    return myPipeline;
};

const makeRenderPass = (gpu, pipeline, objectToDraw) => {
    const { device, encoder, context } = gpu;
    const { geometry } = objectToDraw;

    const vertexBuffer = device.createBuffer({
        label: "Cell vertices",
        size: geometry.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, geometry);

    const pass = encoder.beginRenderPass({
        colorAttachments: [{
           view: context.getCurrentTexture().createView(),
           loadOp: "clear",
           storeOp: "store",
           clearValue: { r: 0, g: 0, b: 0.1, a: 1 },
        }]
      });

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(geometry.length / 3);

    pass.end();
};

const draw = (gpuStuff, objectToDraw) => {
    if (!successful(gpuStuff)) return gpuStuff;
    else gpuStuff = unwrap(gpuStuff);

    const { device, encoder } = gpuStuff;

    const pipeline = makeRenderPipeline(gpuStuff, objectToDraw);
    makeRenderPass(gpuStuff, pipeline, objectToDraw);
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

}

const testWebGpu = async () => {
    const gpu = await initWebGpu();
    draw(gpu, makeTriangle());
}