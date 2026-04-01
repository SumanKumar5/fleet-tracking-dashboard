type Props = {
  setFilter: (f: string) => void;
};

export default function Filters({ setFilter }: Props) {
  const btn = "px-3 py-1 bg-gray-700 rounded mr-2";

  return (
    <div className="mb-4">
      <button className={btn} onClick={() => setFilter("all")}>
        All
      </button>
      <button className={btn} onClick={() => setFilter("active")}>
        Active
      </button>
      <button className={btn} onClick={() => setFilter("issue")}>
        Issues
      </button>
      <button className={btn} onClick={() => setFilter("completed")}>
        Completed
      </button>
    </div>
  );
}
