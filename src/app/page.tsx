import { CampaignGateway } from "@/components/campaign-gateway";
import { napoleonConfig } from "@/lib/simulators/napoleon";
import { queenConfig } from "@/lib/simulators/queen";

export default function HomePage() {
  return <CampaignGateway campaigns={[queenConfig, napoleonConfig]} />;
}
