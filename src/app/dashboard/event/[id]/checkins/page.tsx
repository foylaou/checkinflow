import CheckinListClient from '@/components/CheckinListClient';
import {use} from "react";

export default function CheckinListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use<{ id: string }>(params);

  return <CheckinListClient eventId={id} />;
}
