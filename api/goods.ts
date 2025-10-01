import { request } from "@/utils/http";

export function createGoodsApi(data: any) {
  return request.post({
    url: "/api/goods",
    data,
  });
}

export function getGoodsListApi(params: any) {
  return request.get({
    url: "/api/goodsList",
    params,
  });
}
export function getGoodsDetailApi(id: any) {
  return request.get({
    url: `/api/goods/${id}`,
  });
}

export function goodsOutInRecordApi(data = {}) {
  return request.post({
    url: "/api/goods/record",
    data,
  });
}
export function getGoodsRecordApi(data = {}) {
  return request.post({
    url: "/api/goods/recordList",
    data,
  });
}

// 获取商品月度统计
export function getGoodsMonthDataApi(data = {}) {
  return request.post({
    url: "/api/goods/month-statistics",
    data,
  });
}
