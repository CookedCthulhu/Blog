namespace Fmt {
    export function error(msg: string, details?: unknown): never {
        if (details == null) throw new Error(msg);

        throw new Error(JSON.stringify([msg, details], null, '  '));
    }
}

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
        RELEASE = 0,
        /** May add extra information to the DOM. */
        DEBUG = 1 << 0,
        /** Full logging to the console. */
        TRACE = 1 << 1,
    }

    function assertNatural(val: unknown): number {
        if (val == null) return Fmt.error('Value cannot be null or undefined.');
        if (typeof val !== 'number') return Fmt.error('Value must be a number.');
        if (val != (val | 0)) return Fmt.error('Value must be an integer.', { val });
        if (val < 0) return Fmt.error('Value must be positive.', { val });

        return val | 0;
    }

    function assertReal(val: unknown): number {
        if (val == null) return Fmt.error('Value cannot be null or undefined.');
        if (typeof val !== 'number') return Fmt.error('Value must be a number.');
        if (!isFinite(val)) return Fmt.error('Value must be finite.');
        if (isNaN(val)) return Fmt.error('Value was NaN.');

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
            if (typeof start !== 'number') return Fmt.error('Expected start to be of type number.');
            if (typeof length !== 'number') return Fmt.error('Expected length to be of type number.');

            start = start | 0;
            length = length | 0;

            if (start === 0 && length === 0) return Readonly.empty();

            if (start < 0) return Fmt.error('Start out of range: start was less than zero.', { start });
            if (start >= source.length) return Fmt.error('Start out of range: start was greater or equal to length.', { start, length });
            if (length < 0) return Fmt.error('Length out of range: length was less than zero.', { length });
            if ((start + length) > source.length) return Fmt.error('Length out of range: start + length was greater than source length.', { start, length, totalLength: this.length });

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
            if (typeof index !== 'number') return Fmt.error('Expected index to be of type number.');
            if (index < 0) return Fmt.error('Index out of range: index was less than zero.', { index });
            if (index >= this.length) return Fmt.error('Index out of range: index was greater or equal to length.', { index, length: this.length });
        }

        public(index: number): T { return this.at(index); }

        public at(index: number): T {
            this.assertInBounds(index);
            return this.source[this.start + index];
        }

        public sliceStart(start: number): Readonly<T> {
            if (typeof start !== 'number') return Fmt.error('Expected start to be of type number.');

            start = start | 0;
            if (start === 0) return this;

            if (start < 0) return Fmt.error('Start out of range: start was less than zero.', { start });
            if (start >= this.totalLength) return Fmt.error('Start out of range: start was greater or equal to length.', { start, totalLength: this.totalLength });

            return new Readonly(this.source, start, this.totalLength - start);
        }

        public sliceLength(length: number): Readonly<T> {
            if (typeof length !== 'number') return Fmt.error('Expected length to be of type number.');
            if (length < 0) return Fmt.error('Length out of range: length was less than zero.', { length });
            if (length > this.totalLength) return Fmt.error('Length out of range: length was greater than total length.', { length, totalLength: this.totalLength });

            length = length | 0;

            if (length === 0) return Readonly.empty();
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
            const el = document.createElement('p');
            el.innerText = String(value);
            el.style.width = '100%';
            return el;
        }

        public get name() { return 'builtin-default'; }
    }

    export interface ColumnDefinition<TRow> {
        header?: string;
        value(row: TRow): string | number | null | undefined;
        valueRenderer(row: TRow): ValueRenderer;
        classes: Record<string, boolean>;
    }

    export class ColumnWrapper implements ColumnDefinition<unknown> {
        private static readonly EMPTY = Object.freeze({});
        public constructor(private readonly columnDefinition: ColumnDefinition<unknown>) {}

        public value(row: unknown) { return String(this.columnDefinition.value(row) ?? ''); }
        public valueRenderer(row: unknown) { return this.columnDefinition.valueRenderer(row) ?? CellRendererDefault.INSTANCE; }
        public get header() { return this.columnDefinition.header ?? ''; }
        public get classes(): Record<string, boolean> { return this.columnDefinition.classes ?? ColumnWrapper.EMPTY; }
    }

    const DEFAULT_COLUMN_DEFINITION: ColumnDefinition<never> = {
        header: '',
        value() { return ''; },
        valueRenderer() { return CellRendererDefault.INSTANCE; },
        classes: {},
    };
    export function makeColumnDefinition<TRow>(def: Partial<ColumnDefinition<TRow>>): ColumnDefinition<TRow> {
        return {
            ...DEFAULT_COLUMN_DEFINITION,
            ...def,
        };
    }
}

namespace TableBuilder {
    export class BuilderStyles {
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
            style.rel  = 'stylesheet';
            style.media = 'all';

            const allDone = new Promise<CSSStyleSheet | null>((res, rej) => {
                    style.onload = () => res(style.sheet);
                    style.onerror = err => rej(err);
                })
                .then(s => {
                    if (!s) return Promise.reject('Loading CSS style sheet completed but could not get sheet data.');
                    for (const rule of s.cssRules) {
                        buffer.insertRule(rule.cssText);
                    }
                    return Promise.resolve<void>(undefined);
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

    export class BuilderStart {
        public constructor(
            private readonly styleSheets: CSSStyleSheet[],
        ) {}

        public withRowHeight(px: Types.PixelMeasure): BuilderType {
            return new BuilderType(this.styleSheets, px);
        }
    }

    export class BuilderType {
        public constructor(
            private readonly styleSheets: CSSStyleSheet[],
            private readonly rowHeight: Types.PixelMeasure,
        ) {}

        public plainTable(): BuilderStylesPlainTable {
            return new BuilderStylesPlainTable(this.styleSheets, this.rowHeight);
        }
    }

    export class BuilderStylesPlainTable {
        public constructor(
            private readonly styleSheets: CSSStyleSheet[],
            private readonly rowHeight: Types.PixelMeasure,
        ) {}

        public typed<TRow>(): BuilderColumnPlainTable<TRow> {
            return new BuilderColumnPlainTable(this.styleSheets, this.rowHeight);
        }
    }

    export class BuilderColumnPlainTable<TRow> {
        public constructor(
            private readonly styleSheets: CSSStyleSheet[],
            private readonly rowHeight: Types.PixelMeasure,
        ) {}

        public columns(...columnDefinitions: Column.ColumnDefinition<TRow>[]): BuilderDonePlainTable<TRow> {
            return new BuilderDonePlainTable(this.styleSheets, this.rowHeight, columnDefinitions);
        }
    }

    export class BuilderDonePlainTable<TRow> {
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
    interface Backend {
        updateHeadline(str: string): void;
        updateTable(columns: Column.ColumnWrapper[], rows: unknown[]): void;
    }

    export class HtmlBackend implements Backend {
        private static newDiv(): HTMLDivElement { return document.createElement('div'); }
        private static newTable(): HTMLTableElement { return document.createElement('table'); }
        private static newTHead(): HTMLTableSectionElement { return document.createElement('thead'); }
        private static newTBody(): HTMLTableSectionElement { return document.createElement('tbody'); }
        private static newTableRow(): HTMLTableRowElement { return document.createElement('tr'); }
        private static newTableCell(): HTMLTableCellElement { return document.createElement('td'); }
        private static newTableHeadingCell(): HTMLTableCellElement { return document.createElement('th'); }
        private static newHeading(): HTMLHeadingElement { return document.createElement('h1'); }

        public static initialize(mode: Types.Mode, mutParentElement: HTMLElement, styles: CSSStyleSheet[], rowHeight: Types.PixelMeasure): HtmlBackend {
            const table = HtmlBackend.newTable();
            {
                table.style.width = '100%';
                table.style.height = '100%';
                table.classList.add('table-container');
            }

            const heading = HtmlBackend.newHeading();
            {
                heading.classList.add('headline');
            }

            const container = HtmlBackend.newDiv();
            {
                container.appendChild(heading);
                container.appendChild(table);
                container.classList.add('canvas');
            }

            const root = mutParentElement.attachShadow({ mode: 'open' });
            {
                root.appendChild(container);
                root.adoptedStyleSheets = styles;
            }

            const height = `${rowHeight}px`;

            return new HtmlBackend(mode, height, table, heading, root);
        }

        private constructor(
            private readonly mode: Types.Mode,
            private readonly heightStr: string,
            private mutRefTable: HTMLTableElement,
            private mutRefHeading: HTMLHeadingElement,
            private mutRefShadow: ShadowRoot,
        ) {}

        private get debug(): boolean { return (this.mode & Types.Mode.DEBUG) !== 0; }

        private clearTable() {
            while (this.mutRefTable.children.length > 0) this.mutRefTable.lastChild!.remove();
        }

        private appendCell(mutRow: HTMLTableRowElement, column: Column.ColumnWrapper, data: unknown) {
            const cell = HtmlBackend.newTableCell();
            {
                const value = column.value(data);
                const renderer = column.valueRenderer(data);
                cell.appendChild(renderer.render(value));

                for (const clss in column.classes) {
                    if (!clss) continue;
                    cell.classList.add(clss);
                }

                if (this.debug) { cell.setAttribute('info_renderer', renderer.name ?? 'unknown'); }
            }
            mutRow.appendChild(cell);
        }

        private appendRow(mutTableBody: HTMLTableSectionElement, columns: Column.ColumnWrapper[], data: unknown) {
            const row = HtmlBackend.newTableRow();
            {
                row.style.height = this.heightStr;
                for (const col of columns) { this.appendCell(row, col, data); }
            }
            mutTableBody.appendChild(row);
        }

        private appendHeadingCell(mutHead: HTMLTableSectionElement, column: Column.ColumnWrapper) {
            const heading = HtmlBackend.newTableHeadingCell();
            {
                heading.innerText = column.header ?? '';
                for (const clss in column.classes) {
                    if (!clss) continue;
                    heading.classList.add(clss);
                }
            }
            mutHead.appendChild(heading);
        }

        private appendColumnHeadings(columns: Column.ColumnWrapper[]) {
            const head = HtmlBackend.newTHead();
            {
                for (const col of columns) { this.appendHeadingCell(head, col); }
            }
            this.mutRefTable.appendChild(head);
        }

        private appendBody(columns: Column.ColumnWrapper[], rows: unknown[]) {
            const body = HtmlBackend.newTBody();
            {
                for (const row of rows) { this.appendRow(body, columns, row); }
            }
            this.mutRefTable.appendChild(body);            
        }

        public updateHeadline(newHeadline: string) {
            this.mutRefHeading.innerText = newHeadline;
        }

        public updateTable(columns: Column.ColumnWrapper[], rows: unknown[]) {
            this.clearTable();
            this.appendColumnHeadings(columns);
            this.appendBody(columns, rows);
        }
    }
}

namespace Trace {
    export interface Trace {
        info(section: string, key?: string, value?: unknown): void;
        warn(section: string, key?: string, value?: unknown): void;
        error(section: string, key?: string, value?: unknown): void;
    }

    class TraceOn implements Trace {
        private static fmt(parent: string, section: string, key?: string, value?: unknown): string {
            if (value && typeof value === 'object') {
                value = JSON.stringify(value, null, 2);
            }

            if (key != null && value != null) return `${parent}: ${section} => { ${key}: ${value} }`;
            if (key != null) return `${parent}: ${section} => ${key}`;
            if (value != null) return `${parent}: ${section} => ${value}`;
            return `${parent}: ${section}`;
        }
        public constructor(private readonly parent: string) {}

        public info(section: string, key?: string, value?: unknown) { console.log(TraceOn.fmt(this.parent, section, key, value)); }
        public warn(section: string, key?: string, value?: unknown) { console.warn(TraceOn.fmt(this.parent, section, key, value)); }
        public error(section: string, key?: string, value?: unknown) { console.error(TraceOn.fmt(this.parent, section, key, value)); }
    }

    class TraceOff implements Trace {
        public static readonly INSTANCE = new TraceOff();
        private constructor() {}

        public info() { }
        public warn() { }
        public error() { }
    }

    export function initialize(mode: Types.Mode, parent: string): Trace {
        if ((mode & Types.Mode.TRACE) !== 0) return new TraceOn(parent);
        return TraceOff.INSTANCE;
    }
}

namespace Table {
    export interface Updatable<TRow> {
        rows?: TRow[];
        columns?: Column.ColumnDefinition<TRow>[];
        headline?: string;
    }

    export interface Table<TRow> {
        update(thingsToUpdate: Updatable<TRow>): void;

        get element(): HTMLElement;
    }

    class Engine {
        private rows: unknown[] = [];
        private headline: string | null | undefined = undefined;
        private readonly renderer: TableDom.HtmlBackend;
        private readonly trace: Trace.Trace;

        public constructor(
            canvas: HTMLElement,
            rowHeight: Types.PixelMeasure,
            private columnDefinitions: Column.ColumnWrapper[],
            styleSheets: CSSStyleSheet[],
            mode: Types.Mode,
        ) {
            this.renderer = TableDom.HtmlBackend.initialize(mode, canvas, styleSheets, rowHeight);
            this.trace = Trace.initialize(mode, 'engine');
        }

        public updateColumns(columnDefinitions: Column.ColumnWrapper[]) {
            this.trace.info('update columns', 'columns', columnDefinitions.length);
            this.columnDefinitions = columnDefinitions;
        }

        public updateRows(rows: unknown[]) {
            this.trace.info('update rows', 'rows', rows.length);
            this.rows = rows;
        }

        public updateHeadline(headline: string | null | undefined) {
            this.trace.info('update headline', 'headline', headline);
            this.headline = headline;
        }

        public commitUpdate(): void {
            this.trace.info('commit update');
            this.renderer.updateTable(this.columnDefinitions, this.rows);
            this.renderer.updateHeadline(this.headline ?? '');
        }
    }

    export class PlainTable<TRow> implements Table<TRow> {
        private readonly canvas = document.createElement('div');
        private readonly engine: Engine;
        private readonly trace: Trace.Trace;

        public constructor(
            private readonly rowHeight: Types.PixelMeasure,
            styleSheets: CSSStyleSheet[],
            mode: Types.Mode,
        ) {
            this.engine = new Engine(this.canvas, this.rowHeight, [], styleSheets, mode);
            this.trace = Trace.initialize(mode, 'table');
        }

        public update(thingsToUpdate: Updatable<TRow>) {
            this.trace.info('update', 'content', thingsToUpdate);

            if (thingsToUpdate.columns) this.engine.updateColumns(thingsToUpdate.columns.map(c => new Column.ColumnWrapper(c)));
            if (thingsToUpdate.rows) this.engine.updateRows(thingsToUpdate.rows);
            if ('headline' in thingsToUpdate) this.engine.updateHeadline(thingsToUpdate.headline);

            this.engine.commitUpdate();
        }

        public get element() { return this.canvas; }
    }
}

export { Table, TableBuilder, Types, Column };