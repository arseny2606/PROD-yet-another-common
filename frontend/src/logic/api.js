import axios from 'axios'
import { store } from '@/store/index.js'

import.meta.env.VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '/api'

class Api {
  constructor() {
    this.client = axios.create()

    this.client.interceptors.request.use(
      (config) => {
        if (!localStorage.getItem('token')) {
          return config
        }

        const newConfig = {
          headers: {},
          ...config
        }

        newConfig.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
        return newConfig
      },
      (e) => Promise.reject(e)
    )

    this.client.interceptors.response.use(
      (r) => r,
      async (error) => {
        if (error.response.status !== 401) {
          throw error
        }

        store.auth.isAuth = false
        throw error
      }
    )
  }

  async register({ login, password, name }) {
    await this.client.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
      login,
      password,
      name
    })
    const { data } = await this.client.post(`${import.meta.env.VITE_BACKEND_URL}/auth/sign-in`, {
      login,
      password
    })

    localStorage.setItem('token', data.token)
  }

  async login({ login, password }) {
    const { data } = await this.client.post(`${import.meta.env.VITE_BACKEND_URL}/auth/sign-in`, {
      login,
      password
    })

    localStorage.setItem('token', data.token)
  }

  createOrganization({ name, description }) {
    return this.client
      .post(`${import.meta.env.VITE_BACKEND_URL}/organizations`, {
        name,
        description
      })
      .then(({ data }) => {
        return data.organization
      })
  }

  getOrganizations() {
    return this.client.get(`${import.meta.env.VITE_BACKEND_URL}/organizations`).then(({ data }) => {
      return data.organizations
    })
  }

  async syncAuth() {
    return await this.client.get(`${import.meta.env.VITE_BACKEND_URL}/auth/check`)
  }

  getProfile() {
    return this.client.get(`${import.meta.env.VITE_BACKEND_URL}/auth/profile`).then(({ data }) => {
      return data.profile
    })
  }

  getOrganizationUsers(id) {
    return this.client
      .get(`${import.meta.env.VITE_BACKEND_URL}/organizations/${id}/users`)
      .then(({ data }) => {
        if (data.reason) {
          return null
        }
        return data.users
      })
  }

  getOrganizationBots(id) {
    return this.client
      .get(`${import.meta.env.VITE_BACKEND_URL}/organizations/${id}/bots`)
      .then(({ data }) => {
        if (data.reason) {
          return null
        }
        return data.bots
      })
  }

  createOrganizationBots(id, token) {
    return this.client
      .post(`${import.meta.env.VITE_BACKEND_URL}/organizations/${id}/bots`, { token: token })
      .then(({ data }) => {
        if (data.reason) {
          throw 'Неверный токен'
        }
        return data.id
      })
      .catch(() => {
        throw 'Неправильный токен'
      })
  }

  getOrganizationInfo(id) {
    return this.client
      .get(`${import.meta.env.VITE_BACKEND_URL}/organizations/${id}`)
      .then(({ data }) => {
        if (data.reason) {
          return null
        }
        return data
      })
  }

  addChannels(id, ch_id, bot_id) {
    console.log(bot_id)
    return this.client
      .post(`${import.meta.env.VITE_BACKEND_URL}/organizations/${id}/channels`, {id: ch_id, bot_id: bot_id})
      .then(({ data }) => {
      
        return data
      }) .catch(() => {
        throw 'Канал не найден или уже используется'
      })
  }
  getChannels(id) {
    return this.client
      .get(`${import.meta.env.VITE_BACKEND_URL}/organizations/${id}/channels`)
      .then(({ data }) => {
        if (data.reason) {
          return null
        }
        return data.channels
      })
  }

  deleteChannels(id, ch_id) {
    return this.client
      .delete(`${import.meta.env.VITE_BACKEND_URL}/organizations/${id}/channels`,{data: {id: ch_id}})
      .then(({ data }) => {
        if (data.reason) {
          return null
        }
        return data.channels
      })
  }
}

export const api = new Api()
