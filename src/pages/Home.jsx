import PaginatedGridUsageExample from "../components/examples/PaginatedGridUsageExample";

const Home = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Welcome to CutRoll</h1>
      <p className="text-gray-300">Your movie tracking and review platform</p>

      <PaginatedGridUsageExample />
    </div>
  );
};

export default Home;