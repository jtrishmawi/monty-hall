import Door from "@/components/Door";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { montyHallMachine } from "@/machines/montyHall";
import { useActor } from "@xstate/react";
import { useEffect, useState } from "react";

const nf = (n: number) => (Number(n * 100) || 0).toFixed(2);

const stateString = localStorage.getItem("monty-state");
const restoredState = stateString ? JSON.parse(stateString) : undefined;

const App = () => {
  const [autoMode, setAutoMode] = useState(false);
  const [delayValue, setDelayValue] = useState(500);

  const [snapshot, send, actor] = useActor(montyHallMachine, {
    snapshot: restoredState,
  });

  actor.subscribe(() => {
    localStorage.setItem("monty-state", JSON.stringify(actor.getSnapshot()));
  });

  useEffect(() => {
    if (autoMode) {
      const interval = setInterval(() => {
        switch (snapshot.value) {
          case "pick":
            send({
              type: "pickDoor",
              doorIndex: Math.floor(
                Math.random() * snapshot.context.doors.length
              ),
            });
            break;
          case "reveal":
            if (Math.random() > 0.5) send({ type: "stay" });
            else send({ type: "switchDoor" });
            break;
          case "checkWin":
            send({ type: "startAgain" });
            break;
        }
      }, delayValue);
      return () => clearInterval(interval);
    }
  }, [
    autoMode,
    delayValue,
    send,
    snapshot.context.doors.length,
    snapshot.value,
  ]);

  const handleDoorClick = (index: number) => {
    if (snapshot.matches("pick")) send({ type: "pickDoor", doorIndex: index });
  };

  return (
    <div>
      <h1 className="text-5xl font-bold text-center mt-20">Monty Hall</h1>
      <div className="flex gap-20 justify-center items-center mt-20">
        {snapshot.context.doors.map((door) => (
          <Door
            key={door.index}
            onClick={handleDoorClick}
            content={door}
            selected={
              !snapshot.matches("checkWin") &&
              snapshot.context.pickedDoor === door.index
            }
            open={
              (!snapshot.matches("checkWin") &&
                snapshot.context.options.includes(door)) ||
              (snapshot.matches("checkWin") &&
                snapshot.context.pickedDoor === door.index)
            }
          />
        ))}
      </div>
      <div className="grid grid-cols-2">
        <div>
          <div className="flex flex-col gap-2 justify-center items-start m-20">
            <p className="text-xl">
              Total Switches Plays: {snapshot.context.totalSwitchPlays}
            </p>
            <p className="text-xl">
              Total Switches Wins: {snapshot.context.totalSwitchWins}
            </p>
            <p className="text-xl">
              Switch Win Rate:{" "}
              {nf(
                snapshot.context.totalSwitchWins /
                  snapshot.context.totalSwitchPlays
              )}
              %
            </p>
            <p className="text-xl">
              Total Stay Plays: {snapshot.context.totalStayPlays}
            </p>
            <p className="text-xl">
              Total Stay Wins: {snapshot.context.totalStayWins}
            </p>
            <p className="text-xl">
              Stay Win Rate:{" "}
              {nf(
                snapshot.context.totalStayWins / snapshot.context.totalStayPlays
              )}
              %
            </p>
          </div>
          <div className="flex gap-10 justify-center items-center m-20">
            <Button size={"lg"} onClick={() => setAutoMode(!autoMode)}>
              {autoMode ? "Stop" : "Start"} Auto Play
            </Button>
            <Slider
              value={[delayValue]}
              onValueChange={(v) => setDelayValue(v[0])}
              min={20}
              max={1000}
              step={1}
            />
          </div>
        </div>
        <div>
          {snapshot.matches("reveal") && (
            <div className="flex gap-10 justify-center items-center mt-20">
              <Button size={"lg"} onClick={() => send({ type: "switchDoor" })}>
                Switch
              </Button>
              <Button size={"lg"} onClick={() => send({ type: "stay" })}>
                Stay
              </Button>
            </div>
          )}
          {snapshot.matches("checkWin") && (
            <>
              <h2 className="text-3xl font-bold text-center mt-20">
                You{" "}
                {snapshot.context.doors[snapshot.context.pickedDoor!].winner
                  ? "won"
                  : "lost"}
                !
              </h2>
              <div className="flex gap-10 justify-center items-center mt-20">
                <Button
                  size={"lg"}
                  onClick={() => send({ type: "startAgain" })}
                >
                  Start Over
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
