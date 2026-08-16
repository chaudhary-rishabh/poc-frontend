import GenerationView from "@/components/GenerationView";

export default async function GenerationPage(props: PageProps<"/generation/[id]">) {
  const { id } = await props.params;
  return <GenerationView sessionId={id} />;
}
