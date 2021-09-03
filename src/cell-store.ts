import create from "zustand";
import produce from "immer";

export interface Pos {
    x: number;
    y: number;
};
export interface Cell {
    pos: Pos;
    alive: boolean;
};

interface CellStore {
    state: {
        cells: Cell[];
    };
    actions: {
        setCells: (fn: (prev: Cell[]) => Cell[]) => void;
    };
};

/**
 * size of the play area
 */
export const rows = 50;
export const columns = 50;

const startingCells = Array(rows * columns).fill(0).map((_, index) => ({
    pos: {
        x: index % rows,
        y: Math.floor(index / rows),
    },
    alive: Math.round(Math.random() * 500) > 400,
})) as Cell[];

export const useCellStore = create<CellStore>(set => ({
    state: {
        cells: startingCells
    },
    actions: {
        setCells: (fn) => set(produce((value: CellStore) => {
            value.state.cells = fn(value.state.cells);
        }))
    },
}))