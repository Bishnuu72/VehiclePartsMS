import { useState, useEffect } from 'react'
import { customersApi } from '../api/customersApi'

export function useCustomerProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data } = await customersApi.getMe()
        setProfile(data)
      } catch (err) {
        const msg = err.response?.data?.message
        setError(msg || 'Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { profile, loading, error }
}
