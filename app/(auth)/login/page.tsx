// app/(auth)/login/page.tsx

import { Suspense } from "react";
import LoginPage from "./LoginPage";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}