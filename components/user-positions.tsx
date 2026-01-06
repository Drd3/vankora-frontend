import { type UserPositionsRequest, useUserPositions } from "@aave/react";

export function UserPositionsList({ request }: { request: UserPositionsRequest }) {
  const { data, loading, error } = useUserPositions(request);

  if (loading) return <div>Loading…</div>;

  if (error) return <div>USER POSITION Error: {error.message}</div>;

  return (
    <div>
      {data.map((position) => (
        <div key={position.id}>
          <h3>Position on {position.spoke.name}</h3>
          <p>Chain: {position.spoke.chain.name}</p>
        </div>
      ))}
    </div>
  );
}
