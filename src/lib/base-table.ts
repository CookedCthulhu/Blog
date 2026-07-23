import { Table, TableBuilder } from "../../lib-agnostic/table";
import reset_css from '../styles/default-reset.css?url';
import variables_css from '../styles/default-variables.css?url';
import table_css from '../styles/default-table.css?url';

export namespace BaseTable {
    let builder: TableBuilder.BuilderStart | undefined = undefined;

    export function getBuilder(): TableBuilder.BuilderStart {
        if (!builder) {
            builder = TableBuilder
                .start
                .withStyleFromUrl(reset_css)
                .withStyleFromUrl(variables_css)
                .withStyleFromUrl(table_css)
                .next();
        }

        return builder;
    }
}