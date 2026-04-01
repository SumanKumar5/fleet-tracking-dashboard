type Props = {
  children: React.ReactNode;
};

export default function Card({ children }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
      {children}
    </div>
  );
}
