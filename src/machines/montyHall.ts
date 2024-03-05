import buildDoors from "@/lib/buildDoors";
import { assign, setup } from "xstate";

type MachineContext = {
  doors: Door[];
  options: Door[];
  pickedDoor: number | undefined;
  totalSwitchPlays: number;
  totalStayPlays: number;
  totalSwitchWins: number;
  totalStayWins: number;
  lastMove: "stay" | "switch" | undefined;
};

export const montyHallMachine = setup({
  types: {
    context: {} as MachineContext,
    events: {} as
      | { type: "stay" }
      | { type: "pickDoor"; doorIndex: number }
      | { type: "switchDoor" }
      | { type: "startAgain" },
  },
}).createMachine({
  context: {
    doors: [],
    options: [],
    pickedDoor: undefined,
    totalSwitchPlays: 0,
    totalStayPlays: 0,
    totalSwitchWins: 0,
    totalStayWins: 0,
    lastMove: undefined,
  },
  id: "MontyHall",
  initial: "pick",
  states: {
    pick: {
      entry: assign(() => ({
        doors: buildDoors(),
        options: [],
        pickedDoor: undefined,
      })),
      on: {
        pickDoor: {
          target: "reveal",
          actions: assign(({ context, event }) => {
            const options = context.doors.filter(
              (door) => door.index !== event.doorIndex && !door.winner
            );
            if (options.length > 1) {
              options.splice(Math.floor(Math.random() * options.length), 1);
            }
            return {
              pickedDoor: event.doorIndex,
              options,
            };
          }),
        },
      },
      description: "the user picks a door",
    },
    reveal: {
      on: {
        stay: {
          target: "checkWin",
          actions: assign(({ context }) => ({
            totalStayPlays: context.totalStayPlays + 1,
            lastMove: "stay",
          })),
        },
        switchDoor: {
          target: "checkWin",
          actions: assign(({ context }) => {
            const newPick = context.doors.find(
              (door) =>
                door.index !== context.pickedDoor &&
                !context.options.includes(door)
            );
            return {
              pickedDoor: newPick?.index,
              totalSwitchPlays: context.totalSwitchPlays + 1,
              lastMove: "switch",
            };
          }),
        },
      },
      description: "the computer reveals a losing door",
    },
    checkWin: {
      entry: assign(({ context }) => {
        return {
          totalSwitchWins:
            context.totalSwitchWins +
            (context.lastMove === "switch" &&
            context.doors[context.pickedDoor!].winner
              ? 1
              : 0),
          totalStayWins:
            context.totalStayWins +
            (context.lastMove === "stay" &&
            context.doors[context.pickedDoor!].winner
              ? 1
              : 0),
        };
      }),
      on: {
        startAgain: {
          target: "pick",
        },
      },
      description: "check if the user has won",
    },
  },
});
