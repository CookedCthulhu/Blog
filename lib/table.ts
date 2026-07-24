
namespace Types {
    type Guard<TBaseType, TBrand extends string | symbol> = TBaseType & { readonly [k in TBrand]: 'Type Guard' };
    function guard<TBaseType extends string | number | symbol | null | undefined | bigint, TBrand extends string | symbol>(value: TBaseType, _brand: TBrand) {
        return value as Guard<TBaseType, TBrand>;
    }

    export function unreachable(_: never): never {
        throw new Error('Unreachable.');
    }

    export const enum Mode {
        /** [Default] Turns off all logging and extra information in the DOM. */
        RELEASE = 1,
        /** Does not log but may add extra information to the DOM. May impact performance. May leak developer information to the DOM (such as class names). */
        DEBUG = 2,
        /** Full logging. May impact performance significantly. May clutter the console significantly. */
        TRACE_DEBUG = 3,
    }

    function assertNatural(val: unknown): number {
        if (val == null) throw new Error('Value cannot be null or undefined.');
        if (typeof val !== 'number') throw new Error('Value must be a number.');
        if (val != (val | 0)) throw new Error('Value must be an integer.');
        if (val < 0) throw new Error('Value must be positive.');

        return val | 0;
    }

    function assertReal(val: unknown): number {
        if (val == null) throw new Error('Value cannot be null or undefined.');
        if (typeof val !== 'number') throw new Error('Value must be a number.');
        if (!isFinite(val)) throw new Error('Value must be finite.');
        if (isNaN(val)) throw new Error('Value was NaN.');

        return val;
    }

    export function iter(start: RowIndex, count: RowCount, fn: (index: RowIndex) => void): void;
    export function iter(start: ColumnIndex, count: ColumnCount, fn: (index: ColumnIndex) => void): void;
    export function iter<T extends [RowIndex, RowCount] | [ColumnIndex, ColumnCount]>
    (start: T[0], count: T[1], fn: (index: T[0]) => void) {
        for (let i = 0; i < count; i++) fn((i + start) as T[0]);
    }

    export type PixelMeasure = Guard<number, 'Pixel'>;
    export function pixel(px: number): PixelMeasure { return guard(assertReal(px), 'Pixel'); }

    export type RowCount = Guard<number, 'Row Count'>;
    export function rowCount(count: number): RowCount { return guard(assertNatural(count), 'Row Count'); }

    export type RowIndex = Guard<number, 'Row Index'>;
    export function rowIndex(index: number): RowIndex { return guard(assertNatural(index), 'Row Index'); }

    export type ColumnCount = Guard<number, 'Column Count'>;
    export function columnCount(count: number): ColumnCount { return guard(assertNatural(count), 'Column Count'); }

    export type ColumnIndex = Guard<number, 'Column Index'>;
    export function columnIndex(index: number): ColumnIndex { return guard(assertNatural(index), 'Column Index'); }
}

namespace Slice {
    export class Readonly<T> {
        public static empty<T>(): Readonly<T> { return Readonly.EMPTY_INSTANCE; }
        private static readonly EMPTY_INSTANCE = new Readonly<never>([], 0, 0);

        public static slice(source: Int32Array, start: number, length: number): Readonly<number>;
        public static slice(source: Uint32Array, start: number, length: number): Readonly<number>;
        public static slice(source: Int16Array, start: number, length: number): Readonly<number>;
        public static slice(source: Uint16Array, start: number, length: number): Readonly<number>;
        public static slice(source: Float32Array, start: number, length: number): Readonly<number>;
        public static slice(source: Float64Array, start: number, length: number): Readonly<number>;
        public static slice<T>(source: ArrayLike<T>, start: number, length: number): Readonly<T>;
        public static slice<T>(source: ArrayLike<T>, start: number, length: number): Readonly<T> {
            if (typeof start !== 'number') throw new TypeError('Expected start to be of type number.');
            if (typeof length !== 'number') throw new TypeError('Expected length to be of type number.');

            start = start | 0;
            length = length | 0;

            if (start < 0) throw new Error('Start out of range: start was less than zero.');
            if (start >= this.length) throw new Error('Start out of range: start was greater or equal to length.');
            if (length < 0) throw new Error('Length out of range: length was less than zero.');
            if ((start + length) > this.length) throw new Error('Length out of range: start + length was greater than source length.');

            return new Readonly(source, start, length);
        }

        public static sliceStart(source: Int32Array, start: number): Readonly<number>;
        public static sliceStart(source: Uint32Array, start: number): Readonly<number>;
        public static sliceStart(source: Int16Array, start: number): Readonly<number>;
        public static sliceStart(source: Uint16Array, start: number): Readonly<number>;
        public static sliceStart(source: Float32Array, start: number): Readonly<number>;
        public static sliceStart(source: Float64Array, start: number): Readonly<number>;
        public static sliceStart<T>(source: ArrayLike<T>, start: number): Readonly<T>;
        public static sliceStart<T>(source: ArrayLike<T>, start: number): Readonly<T> {
            return Readonly.slice(source, start, source.length - start);
        }

        public static sliceEnd(source: Int32Array, end: number): Readonly<number>;
        public static sliceEnd(source: Uint32Array, end: number): Readonly<number>;
        public static sliceEnd(source: Int16Array, end: number): Readonly<number>;
        public static sliceEnd(source: Uint16Array, end: number): Readonly<number>;
        public static sliceEnd(source: Float32Array, end: number): Readonly<number>;
        public static sliceEnd(source: Float64Array, end: number): Readonly<number>;
        public static sliceEnd<T>(source: ArrayLike<T>, end: number): Readonly<T>;
        public static sliceEnd<T>(source: ArrayLike<T>, end: number): Readonly<T> {
            return Readonly.slice(source, 0, end);
        }

        public static from(source: Int32Array): Readonly<number>;
        public static from(source: Uint32Array): Readonly<number>;
        public static from(source: Int16Array): Readonly<number>;
        public static from(source: Uint16Array): Readonly<number>;
        public static from(source: Float32Array): Readonly<number>;
        public static from(source: Float64Array): Readonly<number>;
        public static from<T>(source: ArrayLike<T>): Readonly<T>;
        public static from<T>(source: ArrayLike<T>): Readonly<T> {
            return Readonly.slice(source, 0, source.length);
        }

        private constructor(
            private readonly source: ArrayLike<T>,
            private readonly start: number,
            public readonly length: number,
        ) {}

        private assertInBounds(index: number) {
            if (typeof index !== 'number') throw new TypeError('Expected index to be of type number.');
            if (index < 0) throw new Error('Index out of range: index was less than zero.');
            if (index >= this.length) throw new Error('Index out of range: index was greater or equal to length.');
        }

        public(index: number): T { return this.at(index); }

        public at(index: number): T {
            this.assertInBounds(index);
            return this.source[this.start + index];
        }

        public sliceStart(start: number): Readonly<T> {
            if (typeof start !== 'number') throw new TypeError('Expected start to be of type number.');
            if (start < 0) throw new Error('Start out of range: start was less than zero.');
            if (start >= this.totalLength) throw new Error('Start out of range: start was greater or equal to length.');

            start = start | 0;

            if (start === 0) return this;
            return new Readonly(this.source, start, this.totalLength - start);
        }

        public sliceLength(length: number): Readonly<T> {
            if (typeof length !== 'number') throw new TypeError('Expected length to be of type number.');
            if (length < 0) throw new Error('Length out of range: length was less than zero.');
            if (length >= this.totalLength) throw new Error('Length out of range: length was greater or equal to length.');

            length = length | 0;

            if (length === this.length) return this;
            return new Readonly(this.source, this.start, length);
        }

        /** Length of the underlying data source. */
        public get totalLength() { return this.source.length; }
    }
}

namespace BoundingBox {
    export interface AabbLike {
        /** `start x` */
        get sx(): number;
        /** `start y` */
        get sy(): number;
        /** `end x` */
        get ex(): number;
        /** `end y` */
        get ey(): number;
    }

    export class Box implements AabbLike {
        public static readonly POISON = new Box(NaN, NaN, NaN, NaN);
        private static isPoison(val: number) { return val == null || isNaN(val) || !isFinite(val); }

        private constructor(
            public readonly sx: number,
            public readonly sy: number,
            public readonly ex: number,
            public readonly ey: number,
        ) {}

        public static init(left: number, top: number, right: number, bottom: number): Box {
            if (Box.isPoison(left) || Box.isPoison(top) || Box.isPoison(right) || Box.isPoison(bottom)) return Box.POISON;
            return new Box(left, top, right, bottom);
        }

        public static fromDomRect(rect: DOMRect): Box { return Box.init(rect.x, rect.y + rect.width, rect.x + rect.width, rect.y); }
    }

    export class View {
        private static isPoison(val: number) { return val == null || isNaN(val) || !isFinite(val); }

        private aabb: AabbLike;

        public constructor(aabb: AabbLike = Box.POISON) {
            this.aabb = aabb;
        }

        /** Updates this view to use the provided Bounding Box as the data source. */
        public view(aabb: AabbLike) { this.aabb = aabb; }

        public get startX() { return this.aabb.sx; }
        public get startY() { return this.aabb.sy; }
        public get endX() { return this.aabb.ex; }
        public get endY() { return this.aabb.ey; }

        public get left() { return Math.min(this.startX, this.endX); }
        public get right() { return Math.max(this.startX, this.endX); }
        public get top() { return Math.max(this.startY, this.endY); }
        public get bottom() { return Math.min(this.startY, this.endY); }

        public get width() { return this.right - this.left; }
        public get height() { return this.top - this.bottom; }
        public get area() { return this.width * this.height; }

        public get isPoison() { return View.isPoison(this.startX) || View.isPoison(this.startY) || View.isPoison(this.endX) || View.isPoison(this.endY); }
    }
}

namespace Column {
    export interface ValueRenderer {
        get name(): string | null | undefined;
        render(value: unknown): HTMLElement;
    }

    export class CellRendererDefault implements ValueRenderer {
        public static readonly INSTANCE = new CellRendererDefault();
        private constructor() {}

        public render(value: unknown): HTMLElement {
            const el = document.createElement('div');
            el.innerText = String(value);
            return el;
        }

        public get name() { return 'builtin-default'; }
    }

    export interface ColumnDefinition<TRow> {
        header?: string;
        value(row: TRow): string | number | null | undefined;
        valueRenderer(row: TRow): ValueRenderer;
    }

    export function makeSimpleColumnDefinition<TRow>(value: (row: TRow) => string | number | null | undefined): ColumnDefinition<TRow> {
        return {
            value: row => value(row),
            valueRenderer: () => CellRendererDefault.INSTANCE,
        }
    }

    export class ColumnWrapper {
        public constructor(private readonly columnDefinition: ColumnDefinition<unknown>) {}

        public value(row: unknown): string { return String(this.columnDefinition.value(row) ?? ''); }
        public valueRenderer(row: unknown) { return this.columnDefinition.valueRenderer(row) ?? CellRendererDefault.INSTANCE; }
        public get header(): string { return this.columnDefinition.header ?? ''; }
    }
}

namespace TableBuilder {
    class BuilderStyles {
        public static readonly EMPTY = new BuilderStyles([]);
        
        /** Currently unused. Records all styles loaded from an URL. They might not have arrived yet.
         * Might construct a "wait until loading finished" function with this. */
        private readonly stylesInFlight = Array<Promise<unknown>>();

        private constructor(
            private readonly styleSheets: CSSStyleSheet[]
        ) {}

        private appendSheet(sheet: CSSStyleSheet): BuilderStyles {
            return new BuilderStyles([ ...this.styleSheets, sheet ]);
        }

        public withStyleFromUrl(url: string): BuilderStyles {
            const buffer = new CSSStyleSheet();

            const style = document.createElement('link');
            style.type = 'text/css';
            style.href = url;

            const allDone = new Promise<string>((res, rej) => {
                    style.onload = () => res(style.textContent);
                    style.onerror = err => rej(err);
                })
                .then(str => {
                    if (!str) return Promise.reject('Loading CSS style sheet completed but could not get sheet data.');
                    return buffer.replace(str);
                })
                .then(() => {
                    document.head.removeChild(style);
                    return Promise.resolve();
                });

            this.stylesInFlight.push(allDone);
            document.head.appendChild(style);

            return this.appendSheet(buffer);
        }

        public withStyle(css: string): BuilderStyles {
            const sheet = new CSSStyleSheet();
            sheet.replace(css);
            return this.appendSheet(sheet);
        }

        public next(): BuilderStart {
            return new BuilderStart(this.styleSheets);
        }
    }

    class BuilderStart {
        public constructor(
            private readonly styleSheets: CSSStyleSheet[],
        ) {}

        public withRowHeight(px: Types.PixelMeasure): BuilderType {
            return new BuilderType(this.styleSheets, px);
        }
    }

    class BuilderType {
        public constructor(
            private readonly styleSheets: CSSStyleSheet[],
            private readonly rowHeight: Types.PixelMeasure,
        ) {}

        public plainTable(): BuilderStylesPlainTable {
            return new BuilderStylesPlainTable(this.styleSheets, this.rowHeight);
        }
    }

    class BuilderStylesPlainTable {
        public constructor(
            private readonly styleSheets: CSSStyleSheet[],
            private readonly rowHeight: Types.PixelMeasure,
        ) {}

        public typed<TRow>(): BuilderColumnPlainTable<TRow> {
            return new BuilderColumnPlainTable(this.styleSheets, this.rowHeight);
        }
    }

    class BuilderColumnPlainTable<TRow> {
        public constructor(
            private readonly styleSheets: CSSStyleSheet[],
            private readonly rowHeight: Types.PixelMeasure,
        ) {}

        public columns(columnDefinitions: Column.ColumnDefinition<TRow>[]): BuilderDonePlainTable<TRow> {
            return new BuilderDonePlainTable(this.styleSheets, this.rowHeight, columnDefinitions);
        }
    }

    class BuilderDonePlainTable<TRow> {
        public constructor(
            private readonly styleSheets: CSSStyleSheet[],
            private readonly rowHeight: Types.PixelMeasure,
            private readonly columnDefinitions: Column.ColumnDefinition<TRow>[],
        ) {}

        private buildInternal(mode: Types.Mode): Table.Table<TRow> {
            const result = new Table.PlainTable(
                this.rowHeight,
                this.styleSheets,
                mode,
            );

            result.update({ rows: [], columns: this.columnDefinitions });

            return result;
        }

        public build(mode: Types.Mode = Types.Mode.RELEASE) { return this.buildInternal(mode); }
    }

    export const start = BuilderStyles.EMPTY;
}

namespace TableDom {
    function makeTable(): HTMLTableElement {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.height = '100%';

        table.classList.add('table-container');

        return table;
    }

    function cellDebugInfo(mutCell: HTMLTableCellElement, mode: Types.Mode, valueRenderer: Column.ValueRenderer) {
        if (mode !== Types.Mode.DEBUG) return;

        mutCell.setAttribute('debug_renderer', valueRenderer.name ?? 'unknown');
    }

    export function initShadowDom(target: HTMLElement, styleSheets: CSSStyleSheet[]): HTMLTableElement {
        const table = makeTable();
        const root = target.attachShadow({ mode: 'open' });
        
        root.appendChild(table);
        root.adoptedStyleSheets = styleSheets;

        return table;
    }

    export function makeRow(): HTMLTableRowElement {
        const row = document.createElement('tr');

        row.classList.add('table-row');

        return row;
    }

    export function makeCell(row: unknown, column: Column.ColumnDefinition<unknown>, mode: Types.Mode): HTMLTableCellElement {
        const cell = document.createElement('td');
        cell.classList.add('table-cell');

        const renderer = column.valueRenderer(row);
        cellDebugInfo(cell, mode, renderer);

        const cellValue = column.value(row);
        cell.appendChild(renderer.render(cellValue));
        return cell;
    }
}

namespace Trace {
    export interface Trace {
        info(message: unknown): void;
        warn(message: unknown): void;
        error(message: unknown): void;
    }

    class TraceOn implements Trace {
        public static readonly INSTANCE = new TraceOn();
        private constructor() {}

        public info(message: unknown) { console.log(message); }
        public warn(message: unknown) { console.warn(message); }
        public error(message: unknown) { console.error(message); }
    }

    class TraceOff implements Trace {
        public static readonly INSTANCE = new TraceOff();
        private constructor() {}

        public info(message: unknown) { }
        public warn(message: unknown) { }
        public error(message: unknown) { }
    }

    export function initialize(mode: Types.Mode): Trace {
        switch (mode) {
            case Types.Mode.DEBUG:
            case Types.Mode.RELEASE: return TraceOff.INSTANCE;
            case Types.Mode.TRACE_DEBUG: return TraceOn.INSTANCE;
            default: return Types.unreachable(mode);
        }
    }
}

namespace Table {
    export interface Updatable<TRow> {
        rows?: TRow[];
        columns?: Column.ColumnDefinition<TRow>[],
    }

    export interface Table<TRow> {
        update(thingsToUpdate: Updatable<TRow>): void;

        get element(): HTMLElement;
    }

    class Renderer {

        public constructor(
            private readonly canvas: HTMLElement,
            private readonly rowHeight: Types.PixelMeasure,
            styleSheets: CSSStyleSheet[],
            private readonly mode: Types.Mode,
        ) {
            this.table = TableDom.initShadowDom(canvas, styleSheets);
            this.trace = Trace.initialize(mode);
        }

        private readonly trace: Trace.Trace;
        private readonly dimensions = new BoundingBox.View();
        private readonly table: HTMLTableElement;

        private columnCount = Types.columnCount(0);
        private rowCount = Types.rowCount(0);

        /** Prepares the renderer for a new update. Returns the row index and count needed to display the update. */
        public requestUpdate(): [Types.RowIndex, Types.RowCount] {
            this.trace.info({ renderer: 'request update' });

            this.dimensions.view(BoundingBox.Box.fromDomRect(this.canvas.getBoundingClientRect()));
            const count = this.dimensions.height / this.rowHeight;
            return [Types.rowIndex(0), Types.rowCount(Math.ceil(count) + 2)];
        }

        public update(data: Slice.Readonly<unknown>, columns: Column.ColumnWrapper[]) {
            this.columnCount = Types.columnCount(columns.length);
            this.rowCount = Types.rowCount(data.length);

            this.trace.info({ renderer: 'update', columns: this.columnCount, rows: this.rowCount });

            while (this.table.children.length > 0) this.table.children.item(0)?.remove();

            Types.iter(Types.rowIndex(0), this.rowCount, rowIndex => {
                const row = TableDom.makeRow();
                const rowData = data.at(rowIndex);
                this.table.appendChild(row);

                Types.iter(Types.columnIndex(0), this.columnCount, columnIndex => {
                    row.appendChild(TableDom.makeCell(rowData, columns[columnIndex], this.mode));
                });
            });
        }
    }

    class Engine {
        private rows = Slice.Readonly.empty<unknown>();
        private readonly renderer: Renderer;
        private readonly trace: Trace.Trace;

        public constructor(
            canvas: HTMLElement,
            rowHeight: Types.PixelMeasure,
            private columnDefinitions: Column.ColumnWrapper[],
            styleSheets: CSSStyleSheet[],
            mode: Types.Mode,
        ) {
            this.renderer = new Renderer(canvas, rowHeight, styleSheets, mode);
            this.trace = Trace.initialize(mode);
        }

        public updateColumns(columnDefinitions: Column.ColumnWrapper[]) {
            this.trace.info({ engine: 'update columns', columns: columnDefinitions.length });
            this.columnDefinitions = columnDefinitions;
        }

        public updateRows(rows: Slice.Readonly<unknown>) {
            this.trace.info({ engine: 'update rows', rows: rows.length });
            this.rows = rows;
        }

        public commitUpdate(): void {
            this.trace.info({ engine: 'commit update' });
            const [ startIndex, _rowCount ] = this.renderer.requestUpdate();
            this.renderer.update(this.rows.sliceStart(startIndex), this.columnDefinitions);
        }
    }

    export class PlainTable<TRow> implements Table<TRow> {
        private readonly canvas = document.createElement('div');
        private readonly engine: Engine;

        public constructor(
            private readonly rowHeight: Types.PixelMeasure,
            styleSheets: CSSStyleSheet[],
            mode: Types.Mode,
        ) {
            this.engine = new Engine(this.canvas, this.rowHeight, [], styleSheets, mode);
        }

        public update(thingsToUpdate: Updatable<TRow>) {
            if (thingsToUpdate.columns) this.engine.updateColumns(thingsToUpdate.columns.map(c => new Column.ColumnWrapper(c)));
            if (thingsToUpdate.rows) this.engine.updateRows(Slice.Readonly.from(thingsToUpdate.rows));

            this.engine.commitUpdate();
        }

        public get element() { return this.canvas; }
    }
}
