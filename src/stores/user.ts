import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {UserType} from "@/interfaces"

export const useUserStore = defineStore('user', () => {
    const id = ref("")
    const name = ref("")
    const roleName = ref("")
    const token = ref("")
    
    const getToken = computed((): string => {
      return token.value
    })

    function setUserStore(user: UserType): void {
        id.value = user.id
        name.value = user.name
        roleName.value = user.roleName
        token.value = user.token
    }

    function clearUserStore(): void {
      id.value = ""
      name.value = ""
      roleName.value = ""
      token.value = ""
    }
  
    return { id, name, roleName, token, getToken, setUserStore, clearUserStore }
  },
  {persist: {
    storage: sessionStorage,
  }})