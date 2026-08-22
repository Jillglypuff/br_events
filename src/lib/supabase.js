import { createClient } from '@supabase/supabase-js'
import { reactive } from 'vue'
import { toast } from './toast'
import {
  sendWelcomeEmail,
  sendOrganizerAssignedEmail,
  sendEventDateConfirmedEmail,
  sendLocationUpdatedEmail,
  sendExpenseAddedEmail,
  sendSponsorshipReceivedEmail,
  sendAdRequestReceivedEmail,
  sendAdminAlertNewSponsorship,
  sendAdminAlertNewAd
} from './resend.js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.slice(0, -9)
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8)
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

const generateEmptyMonths = (year) => {
  const names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return names.map((name, idx) => ({
    id: idx + 1,
    year,
    name,
    theme: null,
    organizerId: null,
    organizerName: null,
    status: 'unassigned',
    image: null
  }))
}

const INITIAL_CURRENT_EVENT = {
  id: 'evt-activo',
  monthId: 8,
  title: 'Evento del Mes',
  organizer: 'Sin Asignar',
  organizerAvatar: null,
  description: 'Reunión mensual de amigas. Crea encuestas para votar detalles y fechas.',
  banner: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000',
  status: 'unassigned',
  location: 'Ubicación por definir',
  mapsUrl: 'https://maps.google.com',
  wazeUrl: 'https://waze.com',
  showChecklist: true,
  polls: [],
  confirmedDate: null,
  checklist: [],
  carpooling: [],
  attendance: []
}

const INITIAL_SPONSORSHIPS = []

const INITIAL_ADS = [
  {
    id: 'ad-1',
    businessName: 'Boutique Tropical Fashion',
    description: 'Ropa deportiva y prendas exclusivas para chicas activas. ¡Obtén 20% de descuento en tu primera compra con el código BREVENTS20!',
    websiteUrl: 'https://instagram.com',
    bannerUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&h=400&fit=crop',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    active: true,
    location: 'all',
    status: 'approved'
  }
]

const loadState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(`br_events_${key}`)
    if (!saved) return fallback
    const parsed = JSON.parse(saved)
    if (key === 'sponsorships' && Array.isArray(parsed)) {
      return parsed.filter(item => item.id !== 'sp-1' && item.id !== 'sp-2' && item.id !== 'sp-3')
    }
    return parsed
  } catch (e) {
    return fallback
  }
}

const saveState = (key, val) => {
  try {
    localStorage.setItem(`br_events_${key}`, JSON.stringify(val))
  } catch (e) {
    console.warn('LocalStorage error:', e)
  }
}

// Reactive Store Export
export const store = reactive({
  selectedYear: 2026,
  isSupabaseConnected: !!supabase,
  friends: loadState('friends', []),
  months: loadState('months', generateEmptyMonths(2026)),
  currentEvent: loadState('currentEvent', INITIAL_CURRENT_EVENT),
  expenses: loadState('expenses', []),
  photos: loadState('photos', []),
  reviews: loadState('reviews', []),
  sponsorships: loadState('sponsorships', INITIAL_SPONSORSHIPS),
  ads: loadState('ads', INITIAL_ADS),
  notifications: loadState('notifications', []),
  currentUser: loadState('currentUser', null),

  // Storage Upload Helper for images
  async uploadImage(file) {
    if (!supabase) return null
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `br_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const { data, error } = await supabase.storage.from('photos').upload(filePath, file)
      if (error) {
        console.warn('Supabase storage upload error:', error)
        return null
      }
      const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(filePath)
      return publicUrlData.publicUrl
    } catch (e) {
      console.warn('Upload exception:', e)
      return null
    }
  },

  // Synchronize from Supabase
  async loadFromSupabase() {
    if (!supabase) return
    try {
      // 1. Fetch Users
      const { data: usersData, error: uErr } = await supabase.from('users').select('*')
      if (!uErr && usersData && usersData.length > 0) {
        this.friends = usersData.map(f => ({
          id: f.id,
          name: f.name,
          email: f.email,
          phone: f.phone,
          shirtSize: f.shirt_size,
          avatar: f.avatar,
          age: f.age ?? null,
          province: f.province || '',
          canton: f.canton || '',
          district: f.district || '',
          role: f.role || 'member'
        }))

        if (this.currentUser) {
          const matched = this.friends.find(f => f.id === this.currentUser.id || f.email === this.currentUser.email)
          if (matched) {
            Object.assign(this.currentUser, matched)
            saveState('currentUser', this.currentUser)
          }
        }
      }

      // 2. Fetch Events
      const { data: eventsData, error: evErr } = await supabase.from('events').select('*')
      if (!evErr && eventsData && eventsData.length > 0) {
        eventsData.forEach(ev => {
          const m = this.months.find(month => month.id === ev.month_id && month.year === ev.year)
          if (m) {
            m.theme = ev.theme
            m.organizerId = ev.organizer_id
            m.organizerName = ev.organizer_name
            m.status = ev.status || 'upcoming'
            m.image = ev.banner
          }
        })
      }

      // 3. Fetch Expenses
      const { data: expensesData, error: eErr } = await supabase.from('expenses').select('*').order('created_at', { ascending: false })
      if (!eErr && expensesData) {
        this.expenses = expensesData.map(e => ({
          id: e.id,
          description: e.description,
          paidBy: e.paid_by,
          amount: Number(e.amount),
          date: e.date,
          status: e.status
        }))
      }

      // 4. Fetch Photos
      const { data: photosData, error: pErr } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
      if (!pErr && photosData) {
        this.photos = photosData.map(p => ({
          id: p.id,
          url: p.url,
          uploader: p.uploader_name,
          date: new Date(p.created_at).toLocaleDateString('es-CR')
        }))
      }

      // 5. Fetch Reviews
      const { data: reviewsData, error: rErr } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
      if (!rErr && reviewsData) {
        this.reviews = reviewsData.map(r => ({
          id: r.id,
          friendName: r.user_name,
          avatar: r.avatar,
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.created_at).toLocaleDateString('es-CR')
        }))
      }

      // 6. Fetch Sponsorships
      const { data: spData, error: spErr } = await supabase.from('sponsorships').select('*').order('created_at', { ascending: false })
      if (!spErr && spData && spData.length > 0) {
        this.sponsorships = spData.map(s => ({
          id: s.id,
          sponsorName: s.sponsor_name,
          contactName: s.contact_name,
          contactPhone: s.contact_phone,
          monthName: s.month_name,
          type: s.type || 'Regalías y Productos',
          productDescription: s.product_description || '',
          amount: Number(s.amount) || 0,
          status: s.status,
          notes: s.notes
        }))
      }
    } catch (err) {
      console.warn('Supabase sync info:', err)
    }
  },

  resetTestData() {
    this.resetAllData()
  },

  async adminAssignMonth(monthId, organizerName, theme) {
    const month = this.months.find(m => m.id === monthId)
    if (month) {
      const friend = this.friends.find(f => f.name === organizerName)
      month.organizerName = organizerName
      month.organizerId = friend ? friend.id : `f-${Date.now()}`
      month.theme = theme
      month.status = 'active'
      saveState('months', this.months)

      if (this.currentEvent && this.currentEvent.monthId === monthId) {
        this.currentEvent.organizer = organizerName
        this.currentEvent.organizerId = month.organizerId
        this.currentEvent.title = theme
        saveState('currentEvent', this.currentEvent)
      }

      // Resend Email Trigger
      if (friend && friend.email) {
        sendOrganizerAssignedEmail(month.name, friend)
      }

      if (supabase) {
        try {
          await supabase.from('events').upsert({
            month_id: monthId,
            year: this.selectedYear,
            title: theme,
            theme: theme,
            organizer_id: month.organizerId,
            organizer_name: organizerName,
            status: 'active'
          }, { onConflict: 'month_id,year' })
        } catch (e) {
          console.warn('Supabase adminAssignMonth:', e)
        }
      }
    }
  },

  async adminResetMonth(monthId) {
    const month = this.months.find(m => m.id === monthId)
    if (month) {
      month.organizerId = null
      month.organizerName = null
      month.theme = null
      month.status = 'unassigned'
      month.image = null
      saveState('months', this.months)

      if (supabase) {
        try {
          await supabase.from('events').delete().match({ month_id: monthId, year: this.selectedYear })
        } catch (e) {
          console.warn('Supabase adminResetMonth:', e)
        }
      }
      toast.info(`Mes ${month.name} liberado exitosamente.`)
    }
  },

  resetAllData() {
    localStorage.clear()
    this.friends = []
    this.months = generateEmptyMonths(this.selectedYear)
    this.currentEvent = { ...INITIAL_CURRENT_EVENT }
    this.expenses = []
    this.photos = []
    this.reviews = []
    this.sponsorships = [...INITIAL_SPONSORSHIPS]
    this.currentUser = null
    saveState('friends', this.friends)
    saveState('months', this.months)
    saveState('expenses', this.expenses)
    saveState('photos', this.photos)
    saveState('reviews', this.reviews)
    saveState('sponsorships', this.sponsorships)
    saveState('currentUser', null)
  },

  async addSponsorship(data) {
    const newSp = {
      id: `sp-${Date.now()}`,
      sponsorName: data.sponsorName,
      contactName: data.contactName || '',
      contactPhone: data.contactPhone || '',
      monthName: data.monthName || 'General',
      type: data.type || 'Regalías y Productos',
      productDescription: data.type === 'Regalías y Productos' ? (data.productDescription || '') : '',
      amount: data.type === 'Monto' ? (Number(data.amount) || 0) : 0,
      status: data.status || 'Confirmado',
      notes: data.notes || ''
    }

    if (supabase) {
      try {
        await supabase.from('sponsorships').insert({
          sponsor_name: newSp.sponsorName,
          contact_name: newSp.contactName,
          contact_phone: newSp.contactPhone,
          month_name: newSp.monthName,
          type: newSp.type,
          product_description: newSp.productDescription,
          amount: newSp.amount,
          status: newSp.status,
          notes: newSp.notes
        })
      } catch (e) {
        console.warn('Supabase insert sponsorship:', e)
      }
    }

    this.sponsorships.unshift(newSp)
    saveState('sponsorships', this.sponsorships)
    toast.success('¡Patrocinio registrado con éxito!')

    // Resend Email Triggers
    sendSponsorshipReceivedEmail(newSp)
    sendAdminAlertNewSponsorship(newSp)
  },

  async updateSponsorship(id, data) {
    const sp = this.sponsorships.find(s => s.id === id)
    if (sp) {
      Object.assign(sp, {
        sponsorName: data.sponsorName,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        monthName: data.monthName,
        type: data.type || 'Regalías y Productos',
        productDescription: data.type === 'Regalías y Productos' ? (data.productDescription || '') : '',
        amount: data.type === 'Monto' ? (Number(data.amount) || 0) : 0,
        status: data.status,
        notes: data.notes
      })

      if (supabase) {
        try {
          await supabase.from('sponsorships').update({
            sponsor_name: sp.sponsorName,
            contact_name: sp.contactName,
            contact_phone: sp.contactPhone,
            month_name: sp.monthName,
            type: sp.type,
            product_description: sp.productDescription,
            amount: sp.amount,
            status: sp.status,
            notes: sp.notes
          }).eq('id', id)
        } catch (e) {
          console.warn('Supabase update sponsorship:', e)
        }
      }

      saveState('sponsorships', this.sponsorships)
      toast.success('¡Patrocinio actualizado!')
    }
  },

  async deleteSponsorship(id) {
    if (supabase) {
      try {
        await supabase.from('sponsorships').delete().eq('id', id)
      } catch (e) {
        console.warn('Supabase delete sponsorship:', e)
      }
    }
    const idx = this.sponsorships.findIndex(s => s.id === id)
    if (idx !== -1) {
      this.sponsorships.splice(idx, 1)
      saveState('sponsorships', this.sponsorships)
      toast.info('Patrocinio eliminado.')
    }
  },

  async addAdCampaign(data) {
    const newAd = {
      id: `ad-${Date.now()}`,
      businessName: data.businessName,
      description: data.description,
      websiteUrl: data.websiteUrl || 'https://instagram.com',
      bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&h=400&fit=crop',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '2026-12-31',
      active: true,
      location: data.location || 'all',
      status: data.status || 'approved'
    }

    if (supabase) {
      try {
        await supabase.from('ad_campaigns').insert({
          business_name: newAd.businessName,
          description: newAd.description,
          website_url: newAd.websiteUrl,
          banner_url: newAd.bannerUrl,
          start_date: newAd.startDate,
          end_date: newAd.endDate,
          active: newAd.active,
          location: newAd.location,
          status: newAd.status
        })
      } catch (e) {
        console.warn('Supabase insert ad campaign:', e)
      }
    }

    this.ads.unshift(newAd)
    saveState('ads', this.ads)
    toast.success('¡Solicitud de campaña publicitaria registrada con éxito!')

    // Resend Email Triggers
    sendAdRequestReceivedEmail(newAd)
    sendAdminAlertNewAd(newAd)
    return newAd
  },

  async updateAdCampaign(id, data) {
    const ad = this.ads.find(a => a.id === id)
    if (ad) {
      Object.assign(ad, data)
      if (supabase) {
        try {
          await supabase.from('ad_campaigns').update({
            business_name: ad.businessName,
            description: ad.description,
            website_url: ad.websiteUrl,
            banner_url: ad.bannerUrl,
            start_date: ad.startDate,
            end_date: ad.endDate,
            active: ad.active,
            location: ad.location,
            status: ad.status
          }).eq('id', id)
        } catch (e) {
          console.warn('Supabase update ad campaign:', e)
        }
      }
      saveState('ads', this.ads)
      toast.success('¡Campaña publicitaria actualizada!')
    }
  },

  async toggleAdActive(id) {
    const ad = this.ads.find(a => a.id === id)
    if (ad) {
      ad.active = !ad.active
      saveState('ads', this.ads)
      toast.info(`Campaña ${ad.active ? 'activada' : 'desactivada'}.`)
    }
  },

  async deleteAdCampaign(id) {
    if (supabase) {
      try {
        await supabase.from('ad_campaigns').delete().eq('id', id)
      } catch (e) {
        console.warn('Supabase delete ad campaign:', e)
      }
    }
    const idx = this.ads.findIndex(a => a.id === id)
    if (idx !== -1) {
      this.ads.splice(idx, 1)
      saveState('ads', this.ads)
      toast.info('Campaña publicitaria eliminada.')
    }
  },

  getInitials(name) {
    if (!name) return 'BR'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  },

  async login(email, password) {
    if (supabase) {
      try {
        const { data: foundUser } = await supabase.from('users').select('*').eq('email', email).single()
        if (foundUser) {
          this.currentUser = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            phone: foundUser.phone,
            shirtSize: foundUser.shirt_size,
            avatar: foundUser.avatar,
            age: foundUser.age ?? null,
            province: foundUser.province || '',
            canton: foundUser.canton || '',
            district: foundUser.district || '',
            role: foundUser.role || 'member'
          }
          saveState('currentUser', this.currentUser)
          return true
        }
      } catch (e) {
        console.warn('Supabase login check:', e)
      }
    }

    const found = this.friends.find(f => f.email.toLowerCase() === email.toLowerCase())
    if (found) {
      this.currentUser = found
      saveState('currentUser', this.currentUser)
      return true
    }

    const tempUser = {
      id: `f-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      phone: '+506 8000-0000',
      shirtSize: 'M',
      avatar: null,
      age: null,
      province: '',
      canton: '',
      district: '',
      role: 'member'
    }
    this.friends.push(tempUser)
    this.currentUser = tempUser
    saveState('friends', this.friends)
    saveState('currentUser', this.currentUser)
    return true
  },

  async register(friendData) {
    const newFriend = {
      id: `f-${Date.now()}`,
      name: friendData.name,
      email: friendData.email,
      phone: friendData.phone || '+506 8000-0000',
      shirtSize: friendData.shirtSize || 'M',
      avatar: null,
      age: null,
      province: '',
      canton: '',
      district: '',
      role: 'member'
    }

    if (supabase) {
      try {
        const { data: created, error } = await supabase.from('users').insert({
          name: newFriend.name,
          email: newFriend.email,
          phone: newFriend.phone,
          shirt_size: newFriend.shirtSize,
          avatar: null,
          age: null,
          province: null,
          canton: null,
          district: null,
          role: 'member'
        }).select().single()

        if (error) {
          console.error('Error al insertar usuario en Supabase:', error)
          toast.warning(`Aviso: No se pudo guardar en Supabase DB (${error.message || 'error desconocido'}).`)
        } else if (created) {
          newFriend.id = created.id
        }
      } catch (e) {
        console.warn('Excepción al insertar usuario en Supabase:', e)
      }
    } else {
      console.warn('Supabase no está conectado. El usuario se guardó solo de forma local.')
    }

    this.friends.push(newFriend)
    this.currentUser = newFriend
    saveState('friends', this.friends)
    saveState('currentUser', this.currentUser)

    // Resend Email Trigger
    sendWelcomeEmail(newFriend)
    return newFriend
  },

  logout() {
    this.currentUser = null
    saveState('currentUser', null)
  },

  async addReview(rating, comment) {
    if (!this.currentUser) return
    const rev = {
      id: `r-${Date.now()}`,
      friendName: 'Amiga Anónima',
      avatar: null,
      rating,
      comment,
      date: 'Reciente'
    }

    if (supabase) {
      try {
        await supabase.from('reviews').insert({
          user_name: 'Amiga Anónima',
          avatar: null,
          rating: rev.rating,
          comment: rev.comment
        })
      } catch (e) {
        console.warn('Supabase insert review:', e)
      }
    }

    this.reviews.unshift(rev)
    saveState('reviews', this.reviews)
  },

  toggleEventChecklistVisibility() {
    this.currentEvent.showChecklist = !this.currentEvent.showChecklist
    saveState('currentEvent', this.currentEvent)
  },

  addChecklistItem(itemText, assignedTo = '') {
    if (!Array.isArray(this.currentEvent.checklist)) {
      this.currentEvent.checklist = []
    }
    const newItem = {
      id: `chk-${Date.now()}`,
      item: itemText.trim(),
      assignedTo: assignedTo.trim() || (this.currentUser ? this.currentUser.name : 'Por asignar'),
      completed: false
    }
    this.currentEvent.checklist.push(newItem)
    saveState('currentEvent', this.currentEvent)
    toast.success('¡Artículo agregado a la lista!')
  },

  deleteChecklistItem(itemId) {
    if (!Array.isArray(this.currentEvent.checklist)) return
    const idx = this.currentEvent.checklist.findIndex(c => c.id === itemId)
    if (idx !== -1) {
      this.currentEvent.checklist.splice(idx, 1)
      saveState('currentEvent', this.currentEvent)
    }
  },

  updateEventLocation(location, mapsUrl, wazeUrl) {
    this.currentEvent.location = location || 'Ubicación por definir'
    this.currentEvent.mapsUrl = mapsUrl || 'https://maps.google.com'
    this.currentEvent.wazeUrl = wazeUrl || ''

    if (Array.isArray(this.currentEvent.attendance) && this.currentEvent.attendance.length > 0) {
      this.currentEvent.attendance = []
      const reConfirmNotif = {
        id: `notif-${Date.now()}`,
        title: '¡Se actualizó la Ubicación del Evento!',
        message: `La organizadora actualizó la ubicación a "${this.currentEvent.location}". Por favor vuelve a confirmar tu asistencia.`,
        dateText: this.currentEvent.confirmedDate || 'Por definir',
        createdAt: new Date().toLocaleString('es-CR'),
        read: false
      }
      this.notifications.unshift(reConfirmNotif)
      saveState('notifications', this.notifications)
      toast.info('Ubicación actualizada. Se solicitó a todas las integrantes volver a confirmar su asistencia.')
    } else {
      toast.success('¡Ubicación actualizada!')
    }

    saveState('currentEvent', this.currentEvent)

    // Resend Email Triggers for all friends
    if (Array.isArray(this.friends)) {
      this.friends.forEach(f => {
        if (f.email) sendLocationUpdatedEmail(this.currentEvent, f.email, f.name)
      })
    }
  },

  async updateUserProfile(updatedData) {
    if (!this.currentUser) return
    Object.assign(this.currentUser, updatedData)

    if (supabase && this.currentUser.id) {
      try {
        await supabase.from('users').update({
          name: this.currentUser.name,
          phone: this.currentUser.phone,
          shirt_size: this.currentUser.shirtSize,
          avatar: this.currentUser.avatar,
          age: this.currentUser.age !== '' && this.currentUser.age !== undefined && this.currentUser.age !== null ? Number(this.currentUser.age) : null,
          province: this.currentUser.province || null,
          canton: this.currentUser.canton || null,
          district: this.currentUser.district || null
        }).eq('id', this.currentUser.id)
      } catch (e) {
        console.warn('Supabase update user:', e)
      }
    }

    const idx = this.friends.findIndex(f => f.id === this.currentUser.id)
    if (idx !== -1) {
      this.friends[idx] = { ...this.currentUser }
      saveState('friends', this.friends)
    }
    saveState('currentUser', this.currentUser)
  },

  async claimMonthWithDetails(monthId, theme, image) {
    if (!this.currentUser) return
    const month = this.months.find(m => m.id === monthId)
    if (month) {
      month.organizerId = this.currentUser.id
      month.organizerName = this.currentUser.name
      month.theme = theme
      month.image = image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500'
      month.status = 'active'

      // Synchronize current active event
      this.currentEvent.organizer = this.currentUser.name
      this.currentEvent.organizerId = this.currentUser.id
      this.currentEvent.organizerAvatar = this.currentUser.avatar
      this.currentEvent.title = theme ? theme : `Evento de ${month.name}`
      this.currentEvent.banner = month.image
      this.currentEvent.monthId = monthId
      this.currentEvent.status = 'active'
      saveState('currentEvent', this.currentEvent)

      if (supabase) {
        try {
          await supabase.from('events').upsert({
            month_id: monthId,
            year: this.selectedYear,
            title: theme,
            theme: theme,
            organizer_id: this.currentUser.id,
            organizer_name: this.currentUser.name,
            banner: month.image,
            status: 'active'
          }, { onConflict: 'month_id,year' })
        } catch (e) {
          console.warn('Supabase upsert event:', e)
        }
      }

      saveState('months', this.months)
    }
  },

  ensurePollsInit() {
    if (!this.currentEvent) return
    if (!Array.isArray(this.currentEvent.polls)) {
      this.currentEvent.polls = []
    }
    if (!Array.isArray(this.currentEvent.attendance)) {
      this.currentEvent.attendance = []
    }
    if (!Array.isArray(this.currentEvent.checklist)) {
      this.currentEvent.checklist = []
    }
    if (!Array.isArray(this.currentEvent.carpooling)) {
      this.currentEvent.carpooling = []
    }
  },

  createPoll(question, initialOptions = []) {
    this.ensurePollsInit()
    const newPoll = {
      id: `poll-${Date.now()}`,
      question: question.trim(),
      options: initialOptions.filter(o => o.trim().length > 0).map((optText, i) => ({
        id: `opt-${Date.now()}-${i}`,
        dateText: optText.trim(),
        votes: []
      }))
    }
    this.currentEvent.polls.push(newPoll)
    saveState('currentEvent', this.currentEvent)
    toast.success('¡Encuesta creada exitosamente!')
    return newPoll
  },

  addPollOption(pollId, optionText) {
    if (!optionText || !optionText.trim()) return
    this.ensurePollsInit()
    const poll = this.currentEvent.polls.find(p => p.id === pollId)
    if (poll) {
      poll.options.push({
        id: `opt-${Date.now()}`,
        dateText: optionText.trim(),
        votes: []
      })
      saveState('currentEvent', this.currentEvent)
      toast.success('¡Opción agregada a la encuesta!')
    }
  },

  deletePoll(pollId) {
    this.ensurePollsInit()
    const idx = this.currentEvent.polls.findIndex(p => p.id === pollId)
    if (idx !== -1) {
      this.currentEvent.polls.splice(idx, 1)
      saveState('currentEvent', this.currentEvent)
      toast.info('Encuesta eliminada.')
    }
  },

  deletePollOption(pollId, optionId) {
    this.ensurePollsInit()
    const poll = this.currentEvent.polls.find(p => p.id === pollId)
    if (poll) {
      const idx = poll.options.findIndex(o => o.id === optionId)
      if (idx !== -1) {
        poll.options.splice(idx, 1)
        saveState('currentEvent', this.currentEvent)
      }
    }
  },

  votePoll(pollId, optionId) {
    if (!this.currentUser) {
      toast.warning('Debes iniciar sesión para votar.')
      return
    }
    this.ensurePollsInit()
    const poll = this.currentEvent.polls.find(p => p.id === pollId)
    if (!poll) return

    const userId = this.currentUser.id
    poll.options.forEach(opt => {
      const idx = opt.votes.indexOf(userId)
      if (idx !== -1) opt.votes.splice(idx, 1)
      if (opt.id === optionId) {
        opt.votes.push(userId)
      }
    })

    saveState('currentEvent', this.currentEvent)
  },

  voteDate(optionId) {
    this.ensurePollsInit()
    const datePoll = this.currentEvent.polls.find(p => p.isDatePoll || p.category === 'fechas') || this.currentEvent.polls[0]
    if (datePoll) {
      this.votePoll(datePoll.id, optionId)
    }
  },

  confirmEventDate(dateText, timeRange = '') {
    this.ensurePollsInit()
    const hadPreviousConfirmations = Array.isArray(this.currentEvent.attendance) && this.currentEvent.attendance.length > 0

    this.currentEvent.confirmedDate = dateText
    this.currentEvent.confirmedTime = timeRange.trim() ? timeRange.trim() : (this.currentEvent.confirmedTime || '9:00 AM - 12:00 MD')
    this.currentEvent.status = 'confirmed'

    if (hadPreviousConfirmations) {
      this.currentEvent.attendance = []
      const reConfirmNotif = {
        id: `notif-${Date.now()}`,
        title: '¡Se actualizó la Fecha/Hora del Evento!',
        message: `${this.currentEvent.organizer || 'La organizadora'} cambió la fecha/hora del evento a "${dateText} (${this.currentEvent.confirmedTime})". Por favor vuelve a confirmar tu asistencia.`,
        dateText: dateText,
        createdAt: new Date().toLocaleString('es-CR'),
        read: false
      }
      this.notifications.unshift(reConfirmNotif)
      toast.info('Fecha/Hora actualizada. Se reinició la lista de asistencia para que todas vuelvan a confirmar.')
    } else {
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: '¡Fecha de Evento Confirmada!',
        message: `${this.currentEvent.organizer || 'La organizadora'} ha fijado la fecha oficial: "${dateText} de ${this.currentEvent.confirmedTime}". ¡Confirma tu asistencia!`,
        dateText: dateText,
        createdAt: new Date().toLocaleString('es-CR'),
        read: false
      }
      this.notifications.unshift(newNotif)
      toast.success(`¡Fecha "${dateText}" fijada en el calendario! Notificación enviada a las demás integrantes.`)
    }

    saveState('notifications', this.notifications)
    saveState('currentEvent', this.currentEvent)

    // Resend Email Triggers for all friends
    if (Array.isArray(this.friends)) {
      this.friends.forEach(f => {
        if (f.email) sendEventDateConfirmedEmail(this.currentEvent, f.email, f.name)
      })
    }
  },

  respondAttendance(status) {
    if (!this.currentUser) {
      toast.warning('Inicia sesión para responder tu asistencia.')
      return
    }
    this.ensurePollsInit()
    const userId = this.currentUser.id
    const existingIdx = this.currentEvent.attendance.findIndex(a => a.userId === userId)

    const record = {
      userId: userId,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      status: status, // 'confirmed' | 'declined' | 'maybe'
      updatedAt: new Date().toLocaleString('es-CR')
    }

    if (existingIdx !== -1) {
      this.currentEvent.attendance[existingIdx] = record
    } else {
      this.currentEvent.attendance.push(record)
    }

    saveState('currentEvent', this.currentEvent)

    const labels = { confirmed: 'que SÍ asistirás 🎉', declined: 'que NO podrás asistir 😢', maybe: 'que TAL VEZ asistirás 🤔' }
    toast.success(`Has confirmado ${labels[status] || status}`)
  },

  markNotificationRead(notifId) {
    const n = this.notifications.find(item => item.id === notifId)
    if (n) {
      n.read = true
      saveState('notifications', this.notifications)
    }
  },

  clearNotifications() {
    this.notifications = []
    saveState('notifications', this.notifications)
  },

  async addExpense(expense) {
    const newExp = {
      id: `exp-${Date.now()}`,
      description: expense.description,
      paidBy: expense.paidBy,
      amount: Number(expense.amount),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      receiptUrl: null
    }

    if (supabase) {
      try {
        await supabase.from('expenses').insert({
          description: newExp.description,
          paid_by: newExp.paidBy,
          amount: newExp.amount,
          date: newExp.date,
          status: 'pending'
        })
      } catch (e) {
        console.warn('Supabase insert expense:', e)
      }
    }

    this.expenses.unshift(newExp)
    saveState('expenses', this.expenses)
    toast.success('¡Gasto registrado en estado Pendiente de comprobante!')

    // Resend Email Triggers for all friends
    if (Array.isArray(this.friends)) {
      this.friends.forEach(f => {
        if (f.email) sendExpenseAddedEmail(newExp, f.email, f.name)
      })
    }
  },

  confirmExpensePayment(expId, receiptUrl = '') {
    const exp = this.expenses.find(e => e.id === expId)
    if (exp) {
      exp.status = 'approved'
      if (receiptUrl) exp.receiptUrl = receiptUrl
      saveState('expenses', this.expenses)
      toast.success('¡Comprobante adjuntado y gasto verificado!')
    }
  },

  async deleteExpense(expId) {
    if (supabase) {
      try {
        await supabase.from('expenses').delete().eq('id', expId)
      } catch (e) {
        console.warn('Supabase delete expense:', e)
      }
    }
    const idx = this.expenses.findIndex(e => e.id === expId)
    if (idx !== -1) {
      this.expenses.splice(idx, 1)
      saveState('expenses', this.expenses)
    }
  },

  toggleChecklist(itemId) {
    const item = this.currentEvent.checklist.find(c => c.id === itemId)
    if (item) {
      item.completed = !item.completed
      saveState('currentEvent', this.currentEvent)
    }
  },

  addCarpoolRoute(driverName, pickupArea, time, seats = 4, carModel = 'Auto') {
    this.ensurePollsInit()
    const newCarpool = {
      id: `car-${Date.now()}`,
      driver: driverName || (this.currentUser ? this.currentUser.name : 'Conductora'),
      pickupArea: pickupArea.trim(),
      time: time.trim() || '5:00 AM',
      seats: Number(seats) || 4,
      carModel: carModel || 'Auto',
      passengers: []
    }
    this.currentEvent.carpooling.push(newCarpool)
    saveState('currentEvent', this.currentEvent)
    toast.success('¡Ruta de auto agregada exitosamente!')
  },

  deleteCarpoolRoute(carId) {
    this.ensurePollsInit()
    const idx = this.currentEvent.carpooling.findIndex(c => c.id === carId)
    if (idx !== -1) {
      this.currentEvent.carpooling.splice(idx, 1)
      saveState('currentEvent', this.currentEvent)
    }
  },

  joinCarpool(carId) {
    if (!this.currentUser) return
    const car = this.currentEvent.carpooling.find(c => c.id === carId)
    if (car && car.passengers.length < car.seats) {
      if (!car.passengers.includes(this.currentUser.name)) {
        car.passengers.push(this.currentUser.name)
        saveState('currentEvent', this.currentEvent)
        toast.success(`¡Te uniste al auto de ${car.driver}!`)
      }
    }
  },

  async addPhoto(photoUrl) {
    if (!this.currentUser) return
    const photo = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: photoUrl,
      uploader: this.currentUser.name,
      date: new Date().toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })
    }

    if (supabase) {
      try {
        await supabase.from('photos').insert({
          url: photo.url,
          uploader_name: photo.uploader
        })
      } catch (e) {
        console.warn('Supabase insert photo:', e)
      }
    }

    this.photos.unshift(photo)
    saveState('photos', this.photos)
  }
})

// Auto sync on startup
store.loadFromSupabase()
