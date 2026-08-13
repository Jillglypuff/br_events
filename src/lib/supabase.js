import { createClient } from '@supabase/supabase-js'
import { reactive } from 'vue'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.slice(0, -9)
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8)
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Clean 12 months structure
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
  monthId: 1,
  title: 'Evento del Mes',
  organizer: 'Sin Asignar',
  organizerAvatar: null,
  description: 'Ingresa los detalles del evento cuando la organizadora se postule.',
  banner: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000',
  status: 'voting',
  location: 'Ubicación a definir',
  mapsUrl: 'https://maps.google.com',
  wazeUrl: 'https://waze.com',
  showChecklist: true,
  poll: {
    question: '¿Qué fecha prefieres para este evento?',
    options: [
      { id: 'opt-1', dateText: 'Primer Fin de Semana', votes: [] },
      { id: 'opt-2', dateText: 'Segundo Fin de Semana', votes: [] }
    ]
  },
  confirmedDate: null,
  checklist: [],
  carpooling: []
}

const loadState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(`br_events_${key}`)
    return saved ? JSON.parse(saved) : fallback
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

// Reactive Store Export (No burned users, currentUser starts null if not logged in)
export const store = reactive({
  selectedYear: 2026,
  isSupabaseConnected: !!supabase,
  friends: loadState('friends', []),
  months: loadState('months', generateEmptyMonths(2026)),
  currentEvent: loadState('currentEvent', INITIAL_CURRENT_EVENT),
  expenses: loadState('expenses', []),
  photos: loadState('photos', []),
  reviews: loadState('reviews', []),
  currentUser: loadState('currentUser', null),

  async loadFromSupabase() {
    if (!supabase) return
    try {
      const { data: friendsData, error: fErr } = await supabase.from('friends').select('*')
      if (!fErr && friendsData && friendsData.length > 0) {
        this.friends = friendsData.map(f => ({
          id: f.id,
          name: f.name,
          email: f.email,
          phone: f.phone,
          shirtSize: f.shirt_size,
          avatar: f.avatar,
          age: f.age,
          province: f.province,
          canton: f.canton,
          district: f.district,
          role: f.role
        }))
      }

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

      const { data: photosData, error: pErr } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
      if (!pErr && photosData) {
        this.photos = photosData.map(p => ({
          id: p.id,
          url: p.url,
          uploader: p.uploader,
          date: p.date
        }))
      }

      const { data: reviewsData, error: rErr } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
      if (!rErr && reviewsData) {
        this.reviews = reviewsData.map(r => ({
          id: r.id,
          friendName: r.friend_name,
          avatar: r.avatar,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        }))
      }
    } catch (err) {
      console.warn('Supabase sync info:', err)
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
    this.currentUser = null
    saveState('friends', this.friends)
    saveState('months', this.months)
    saveState('expenses', this.expenses)
    saveState('photos', this.photos)
    saveState('reviews', this.reviews)
    saveState('currentUser', null)
  },

  getInitials(name) {
    if (!name) return 'BR'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  },

  login(email, password) {
    const found = this.friends.find(f => f.email.toLowerCase() === email.toLowerCase())
    if (found) {
      this.currentUser = found
      saveState('currentUser', this.currentUser)
      return true
    }
    // If no local match, allow temporary session creation with email
    const tempUser = {
      id: `f-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      phone: '+506 8000-0000',
      shirtSize: 'M',
      avatar: null,
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
      age: 25,
      province: 'San José',
      canton: 'Escazú',
      district: 'San Rafael',
      role: 'member'
    }

    if (supabase) {
      try {
        await supabase.from('friends').insert({
          name: newFriend.name,
          email: newFriend.email,
          phone: newFriend.phone,
          shirt_size: newFriend.shirtSize
        })
      } catch (e) {
        console.warn('Supabase insert friend:', e)
      }
    }

    this.friends.push(newFriend)
    this.currentUser = newFriend
    saveState('friends', this.friends)
    saveState('currentUser', this.currentUser)
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
      friendName: this.currentUser.name,
      avatar: this.currentUser.avatar,
      rating,
      comment,
      date: 'Hoy'
    }

    if (supabase) {
      try {
        await supabase.from('reviews').insert({
          friend_name: rev.friendName,
          avatar: rev.avatar,
          rating: rev.rating,
          comment: rev.comment,
          date: rev.date
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

  updateUserProfile(updatedData) {
    if (!this.currentUser) return
    Object.assign(this.currentUser, updatedData)
    const idx = this.friends.findIndex(f => f.id === this.currentUser.id)
    if (idx !== -1) {
      this.friends[idx] = { ...this.currentUser }
      saveState('friends', this.friends)
    }
    saveState('currentUser', this.currentUser)
  },

  claimMonthWithDetails(monthId, theme, image) {
    if (!this.currentUser) return
    const month = this.months.find(m => m.id === monthId)
    if (month) {
      month.organizerId = this.currentUser.id
      month.organizerName = this.currentUser.name
      month.theme = theme
      month.image = image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500'
      month.status = 'upcoming'
      saveState('months', this.months)
    }
  },

  adminAssignMonth(monthId, friendName, theme, image) {
    const month = this.months.find(m => m.id === monthId)
    const friend = this.friends.find(f => f.name === friendName)
    if (month) {
      month.organizerId = friend ? friend.id : 'admin'
      month.organizerName = friendName
      month.theme = theme
      month.image = image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500'
      month.status = 'upcoming'
      saveState('months', this.months)
    }
  },

  adminResetMonth(monthId) {
    const month = this.months.find(m => m.id === monthId)
    if (month) {
      month.organizerId = null
      month.organizerName = null
      month.theme = null
      month.image = null
      month.status = 'unassigned'
      saveState('months', this.months)
    }
  },

  voteDate(optionId) {
    if (!this.currentUser) return
    const poll = this.currentEvent.poll
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

  async addExpense(expense) {
    const newExp = {
      id: `exp-${Date.now()}`,
      description: expense.description,
      paidBy: expense.paidBy,
      amount: Number(expense.amount),
      date: new Date().toISOString().split('T')[0],
      status: 'approved'
    }

    if (supabase) {
      try {
        await supabase.from('expenses').insert({
          description: newExp.description,
          paid_by: newExp.paidBy,
          amount: newExp.amount,
          date: newExp.date,
          status: newExp.status
        })
      } catch (e) {
        console.warn('Supabase insert expense:', e)
      }
    }

    this.expenses.unshift(newExp)
    saveState('expenses', this.expenses)
  },

  async deleteExpense(expId) {
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

  joinCarpool(carId) {
    if (!this.currentUser) return
    const car = this.currentEvent.carpooling.find(c => c.id === carId)
    if (car && car.passengers.length < car.seats) {
      if (!car.passengers.includes(this.currentUser.name)) {
        car.passengers.push(this.currentUser.name)
        saveState('currentEvent', this.currentEvent)
      }
    }
  },

  async addPhoto(photoUrl) {
    if (!this.currentUser) return
    const photo = {
      id: `p-${Date.now()}`,
      url: photoUrl,
      uploader: this.currentUser.name,
      date: 'Reciente'
    }

    if (supabase) {
      try {
        await supabase.from('photos').insert({
          url: photo.url,
          uploader: photo.uploader,
          date: photo.date
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
