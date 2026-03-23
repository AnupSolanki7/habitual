import LoginPage from "./LoginPage";

export default function Page({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  return <LoginPage callbackUrl={searchParams?.callbackUrl} />;
}