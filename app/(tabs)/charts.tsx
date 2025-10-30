import { ThemedText } from "@/components/ThemedText";
import PageView from "@/components/PageView";
import Countdown from "@/components/Countdown";
import { useRunDB } from "@/hooks/useSQLite";
import { useEffect } from "react";

export default function ChartsScreen() {
  const { getRuns } = useRunDB();
  useEffect(() => {
    getRuns().then((runs) => {
      console.log(runs, '获取');
    })
  }, []);
  return (
    <PageView>
      <ThemedText>chart</ThemedText>
    </PageView>
  );
}
