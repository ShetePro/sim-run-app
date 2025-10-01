import { useSession } from "@/components/SessionProvider";

export function checkStatus(status: number, msg: string): void {
  const error = console.log;
  switch (status) {
    case 101:
      error("error http code 101");
      break;
    case 600:
      error("error http code 600");
      break;
    case 400:
      error(`${msg}`);
      break;

    case 401:
      error("error http code 401");
      break;
    case 403:
      console.log('session expired');
      break;
    // 404 请求不存在
    case 404:
      error("error http code 404");
      break;
    case 405:
      error("error http code 405");
      break;
    case 408:
      error("error http code 408");
      break;
    case 429:
      break;
    case 500:
      error("error http code 500");
      break;
    case 501:
      error("error http code 501");
      break;
    case 502:
      error("error http code 502");
      break;
    case 503:
      error("error http code 503");
      break;
    case 504:
      error("error http code 504");
      break;
    case 505:
      error("error http code 505");
      break;
    default:
  }
}
