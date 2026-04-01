import { Socket } from "socket.io-client";

type Props = {
  socket: Socket;
};

export default function Controls({ socket }: Props) {
  const send = (data: any) => socket.emit("control", data);

  const btn = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm mr-2";

  return (
    <div className="mb-4">
      <button className={btn} onClick={() => send({ type: "resume" })}>
        ▶ Play
      </button>
      <button className={btn} onClick={() => send({ type: "pause" })}>
        ⏸ Pause
      </button>

      <button className={btn} onClick={() => send({ type: "speed", value: 1 })}>
        1x
      </button>
      <button className={btn} onClick={() => send({ type: "speed", value: 5 })}>
        5x
      </button>
      <button
        className={btn}
        onClick={() => send({ type: "speed", value: 10 })}
      >
        10x
      </button>
      <button
        className={btn}
        onClick={() => send({ type: "speed", value: 30 })}
      >
        30x
      </button>
    </div>
  );
}
