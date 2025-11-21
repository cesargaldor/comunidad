import Checkout from "@/components/checkout";

export default async function AgoraClubCheckout({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { canceled, booking_id } = await searchParams;

  return <Checkout canceled={!!canceled} bookingId={booking_id as string} />;
}
