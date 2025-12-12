import { useSQLiteContext } from "expo-sqlite";

interface QueryStatisticsParams {
  date: string;
}
export const useRunStatistics = () => {
  const db = useSQLiteContext();

  const queryStatisticsByTime = async ({ date }: QueryStatisticsParams) => {
    console.log(date, '查询统计数据的日期');
    const startTime = new Date(`${date} 00:00:00`).getTime();
    return await db.getAllAsync("SELECT * FROM runs WHERE endTime > ?;", [
      startTime,
    ]);
  };
  return { queryStatisticsByTime };
};
