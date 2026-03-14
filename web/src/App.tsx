import { RouterProvider } from "@tanstack/react-router";
import { UIProvider } from "./components/ui/provider";
import { router } from "./router";

export default function App() {
  return (
    <UIProvider>
      <RouterProvider router={router} />
    </UIProvider>
  );
}
