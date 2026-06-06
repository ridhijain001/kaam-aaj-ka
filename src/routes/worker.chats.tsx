import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/worker/chats")({
  component: () => <Outlet />,
});

