import Link from "next/link";

export default function FakeChat() {
  const randomId = crypto.randomUUID();
  return (
    <>
      <p>this is a fake chat that redirects to a real chat</p>
      <Link href={`/chat/${randomId}`}>Click here to go to the chat</Link>
    </>
  );
}
