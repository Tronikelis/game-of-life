import { makeStyles, createStyles } from "@material-ui/styles"
import { useEffect, useRef, useCallback, memo, useState } from "react";
import useInterval from "use-interval";

import { useCellStore, Pos, rows, columns } from "./cell-store";

// These rules, which compare the behavior of the automaton to real life, can be condensed into the following:

// Any live cell with two or three live neighbours survives.
// Any dead cell with three live neighbours becomes a live cell.
// All other live cells die in the next generation. Similarly, all other dead cells stay dead.

const useStyles = makeStyles(() => createStyles({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    row: {
        width: "100%",
        height: "100%,",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    cell: {
        width: 15,
        height: 15,
        margin: 1,
    },
}));

const potentialNeighbours = ({ x, y }: Pos) => {
    return [
        { x, y: y + 1, },
        { x: x + 1, y: y + 1 },
        { x: x + 1, y },
        { x: x + 1, y: y - 1 },
        { x, y: y - 1 },
        { x: x - 1, y: y - 1 },
        { x: x - 1, y },
        { x: x - 1, y: y + 1 },
    ] as Pos[];
};

// this is to just loop through and create a grid
const xAxis = new Array(rows).fill(0);
const yAxis = new Array(columns).fill(0);

export default function Game() {
    const classes = useStyles();

    const { setCells } = useCellStore(useCallback(state => state.actions, []));
    const cells = useRef(useCellStore.getState().state.cells);

    useEffect(() => useCellStore.subscribe(
        state => cells.current = state.state.cells
    ), []);

    const iteration = () => {
        // TODO
        // loop through all the cells
        // get their alive neighbours
        // based on the rules remove some or/and add some cells

        setCells(cells => cells.map(cell => {
            const neighbours = potentialNeighbours(cell.pos);

            // all alive neighbours
            const alive = neighbours.filter(pos => {
                const neighbour = cells[pos.y * rows + pos.x] ?? false;
                return neighbour.alive;
            });

            // * RULES

            // Any live cell with two or three live neighbours survives.
            if (cell.alive && (alive.length === 2 || alive.length === 3)) {
                return { ...cell, alive: true };
            };
            // Any dead cell with three live neighbours becomes a live cell.
            if (!cell.alive && alive.length === 3) {
                return { ...cell, alive: true };
            };
            // All other live cells die in the next generation. Similarly, all other dead cells stay dead.
            return cell.alive ? { ...cell, alive: false } : cell;
        }));
    };
    
    useInterval(iteration, 200);

    return (
        <div className={classes.root}>
            <div>
                {xAxis.map((_, y) => (
                    <div className={classes.row} key={`${y}`}>
                        {yAxis.map((_, x) => (
                            <BoardCell pos={{ x, y }} key={`${x}${y}`} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface BoardCellProps {
    pos: Pos;
};

const BoardCell = memo(({ pos }: BoardCellProps) => {
    const classes = useStyles();

    const { cells } = useCellStore(useCallback(state => state.state, []));

    const calculateColor = () => {
        const our = cells[pos.y * rows + pos.x];

        if (our?.alive) return "black";
        return "#d1d1d1";
    };

    return (
        <div
            className={classes.cell}
            style={{
                backgroundColor: calculateColor()
            }}
        />
    )
});