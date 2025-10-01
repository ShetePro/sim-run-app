import { request } from "@/utils/http";

export function getBrandListApi() {
  return request.get({
    url: "/api/brand/list",
  });
}
export function createBrandApi(data: any) {
  return request.post({
    url: "/api/brand",
    data,
  });
}

// 详情
export function getBrandDetailApi(id: string | string[]) {
  return request.get({
    url: `/api/brand/${id}`,
  });
}

// 获取品牌月度统计
export function getBrandMonthStatisticsApi(id: string | string[]) {
  return request.get({
    url: `/api/brand/month-statistics/${id}`,
  });
}
// 调用品观网api 获取品牌列表
export function getBrandPinguanApi(params: any) {
  return request.get(
    {
      url: "https://m.pinguan.com/search/brand",
      params,
    },
    {
      joinPrefix: false,
      isTransformRequestResult: false,
    },
  );
}
