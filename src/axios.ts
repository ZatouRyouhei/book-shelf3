/**
 * リクエストのヘッダーにJWTを設定する。
 * 使用する差異にはimport文を
 * import axios from "@/axios"
 * としてください。
 * ヘッダーにJWTを含めない場合は通常通り
 * import axios from "axios"
 * としてください。
 */
import axios from "axios"
import {useUserStore} from "@/stores/user"

// store設定
const userStore = useUserStore()

const axios_instance = axios.create()
axios_instance.defaults.headers.common['Authorization'] = 'Bearer ' + userStore.token

export default axios_instance