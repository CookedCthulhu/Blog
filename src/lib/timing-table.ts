import { Column, TableBuilder, Types } from "../../lib-agnostic/table";
import { BaseTable } from "./base-table";
import type { Timing } from "./timing";

export namespace TimingTable {
    namespace Columns {
        export const nameCol = Column.makeColumnDefinition<Timing>({
            header: 'Method',
            value: x => x.name,
        });

        export const countCol = Column.makeColumnDefinition<Timing>({
            header: 'n',
            value: x => x.count,
            classes: { numeric: true },
        });

        export const meanCol = Column.makeColumnDefinition<Timing>({
            header: 'Mean',
            value: x => `${x.mean.toFixed(1)} ${x.timeUnit}`,
            classes: { numeric: true },
        });

        export const errorCol = Column.makeColumnDefinition<Timing>({
            header: 'Error',
            value: x => `${x.error.toFixed(1)} ${x.timeUnit}`,
            classes: { numeric: true },
        });

        export const stdDevCol = Column.makeColumnDefinition<Timing>({
            header: 'StdDev',
            value: x => `${x.stdDev.toFixed(1)} ${x.timeUnit}`,
            classes: { numeric: true },
        });

        export const ratioCol = Column.makeColumnDefinition<Timing>({
            header: 'Ratio',
            value: x => x.ratio,
            classes: { numeric: true },
        });
    }

    export function buildTable() {
        return BaseTable
            .getBuilder()
            .withRowHeight(Types.pixel(30))
            .plainTable()
            .typed<Timing>()
            .columns(Columns.nameCol, Columns.countCol, Columns.meanCol, Columns.errorCol, Columns.stdDevCol, Columns.ratioCol)
            .build(Types.Mode.TRACE | Types.Mode.DEBUG);
    }
}