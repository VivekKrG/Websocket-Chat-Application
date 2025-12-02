export default function UserList({ users }) {
  return (
    <div className="user-list">
      <h3>Online Users</h3>
      {users.map((u, i) => <div key={i}>{u}</div>)}
    </div>
  );
}
