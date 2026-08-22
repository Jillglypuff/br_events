<template>
  <div class="admin-container animate-fade-in">
    <!-- Header -->
    <div class="admin-header glass-card">
      <div class="header-info">
        <span class="badge-berry">
          <ShieldCheck class="badge-icon" /> Panel Admin
        </span>
        <h2>Administración General & Tablero de Reportes</h2>
        <p>Resumen analítico de eventos, estadísticas de reseñas, usuarios, gastos, patrocinadores y publicidad.</p>
      </div>

      <div class="admin-top-actions">
        <!-- Tab Buttons (Clean layout without test reset button) -->
        <div class="admin-tabs">
          <button 
            v-for="t in adminTabs" 
            :key="t.id"
            :class="['admin-tab-btn', { active: currentTab === t.id }]"
            @click="currentTab = t.id"
          >
            <component :is="t.icon" class="tab-icon" />
            <span>{{ t.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 0: TABLERO DE REPORTES Y ESTADÍSTICAS -->
    <div v-if="currentTab === 'tablero'" class="dashboard-wrapper">
      <!-- 5 Summary KPI Highlight Cards -->
      <div class="kpi-grid">
        <!-- KPI 1: Eventos -->
        <div class="kpi-card glass-card border-berry">
          <div class="kpi-icon-box bg-berry-glow">
            <Calendar class="kpi-icon color-berry" />
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Resumen de Eventos</span>
            <strong class="kpi-value">{{ assignedEventsCount }} / {{ totalEvents }}</strong>
            <small class="kpi-subtext">{{ eventCoveragePercent }}% del año asignado ({{ unassignedEventsCount }} libres)</small>
          </div>
        </div>

        <!-- KPI 2: Reseñas -->
        <div class="kpi-card glass-card border-amber">
          <div class="kpi-icon-box bg-amber-glow">
            <Star class="kpi-icon color-amber" />
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Estadísticas Reseñas</span>
            <strong class="kpi-value">{{ averageRating }} <Star class="star-inline color-amber" /></strong>
            <small class="kpi-subtext">Basado en {{ totalReviewsCount }} valoraciones</small>
          </div>
        </div>

        <!-- KPI 3: Usuarios Registrados -->
        <div class="kpi-card glass-card border-emerald">
          <div class="kpi-icon-box bg-emerald-glow">
            <Users class="kpi-icon color-emerald" />
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Cantidad de Usuarios</span>
            <strong class="kpi-value">{{ totalUsersCount }}</strong>
            <small class="kpi-subtext">Amigas registradas activas</small>
          </div>
        </div>

        <!-- KPI 4: Gastos -->
        <div class="kpi-card glass-card border-pink">
          <div class="kpi-icon-box bg-pink-glow">
            <DollarSign class="kpi-icon color-pink" />
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Gastos por Evento</span>
            <strong class="kpi-value">₡{{ totalExpensesSum.toLocaleString() }}</strong>
            <small class="kpi-subtext">Promedio: ₡{{ avgExpensePerUser.toLocaleString() }} / integrante</small>
          </div>
        </div>

        <!-- KPI 5: Patrocinios -->
        <div class="kpi-card glass-card border-purple">
          <div class="kpi-icon-box bg-purple-glow">
            <Handshake class="kpi-icon color-purple" />
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Patrocinios</span>
            <strong class="kpi-value">₡{{ totalSponsorshipsSum.toLocaleString() }}</strong>
            <small class="kpi-subtext">{{ confirmedSponsorshipsCount }} confirmados, {{ negotiatingSponsorshipsCount }} en negociación</small>
          </div>
        </div>
      </div>

      <!-- DASHBOARD SECTIONS -->
      <div class="dashboard-sections-grid">
        
        <!-- SECTION 1: RESUMEN DE EVENTOS -->
        <div class="dashboard-block glass-card">
          <div class="block-header">
            <h3><Calendar class="block-header-icon" /> Resumen de los Eventos</h3>
            <span class="badge-berry">{{ assignedEventsCount }} Asignados</span>
          </div>

          <div class="event-progress-section">
            <div class="progress-info">
              <span>Cobertura del Calendario 2026</span>
              <strong>{{ eventCoveragePercent }}%</strong>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: eventCoveragePercent + '%' }"></div>
            </div>
          </div>

          <!-- Top Organizers List -->
          <div class="sub-block-title">
            <Award class="sub-icon" /> Ranking de Organizadoras
          </div>
          <div v-if="organizerRanking.length === 0" class="empty-subtext">
            No hay organizadoras asignadas aún.
          </div>
          <div v-else class="organizers-list">
            <div v-for="(org, idx) in organizerRanking" :key="org.name" class="organizer-rank-item">
              <div class="rank-badge">#{{ idx + 1 }}</div>
              <span class="rank-name">{{ org.name }}</span>
              <span class="badge-emerald">{{ org.count }} {{ org.count === 1 ? 'evento' : 'eventos' }}</span>
            </div>
          </div>
        </div>

        <!-- SECTION 2: ESTADÍSTICAS DE RESEÑAS -->
        <div class="dashboard-block glass-card">
          <div class="block-header">
            <h3><Star class="block-header-icon" /> Estadísticas de Reseñas</h3>
            <span class="badge-amber">Promedio: {{ averageRating }} / 5.0</span>
          </div>

          <div class="rating-summary-box">
            <div class="rating-score-hero">
              <span class="score-num">{{ averageRating }}</span>
              <div class="stars-row">
                <Star v-for="s in 5" :key="s" :class="['hero-star-icon', { filled: s <= Math.round(Number(averageRating)) }]" />
              </div>
              <small>{{ totalReviewsCount }} opiniones totales</small>
            </div>

            <div class="rating-bars-list">
              <div v-for="item in ratingDistribution" :key="item.star" class="rating-bar-row">
                <span class="star-label">{{ item.star }} <Star class="star-inline" /></span>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
                </div>
                <span class="bar-count">{{ item.count }} ({{ item.percent }}%)</span>
              </div>
            </div>
          </div>

          <!-- Recent Reviews Preview -->
          <div class="sub-block-title">
            <Star class="sub-icon" /> Reseñas Recientes
          </div>
          <div v-if="store.reviews.length === 0" class="empty-subtext">
            No hay opiniones registradas todavía.
          </div>
          <div v-else class="mini-reviews-list">
            <div v-for="rev in store.reviews.slice(0, 2)" :key="rev.id" class="mini-review-item">
              <div class="rev-header">
                <strong>{{ rev.friendName }}</strong>
                <div class="rev-stars">
                  <Star v-for="s in rev.rating" :key="s" class="star-inline filled" />
                </div>
              </div>
              <p class="rev-comment">"{{ rev.comment }}"</p>
            </div>
          </div>
        </div>

        <!-- SECTION 3: CANTIDAD & PERFIL DE USUARIOS (SEPARADO EN GRÁFICOS DEDICADOS) -->
        <div class="dashboard-block glass-card full-width-block">
          <div class="block-header">
            <h3><Users class="block-header-icon" /> Análisis Demográfico de Integrantes</h3>
            <span class="badge-emerald">{{ totalUsersCount }} Registradas</span>
          </div>

          <div class="user-analytics-grid">
            <!-- Metric 1: Circular Donut Chart by Province -->
            <div class="analytics-card glass-card">
              <div class="sub-block-title">
                <MapPin class="sub-icon" /> Usuarios por Provincia
              </div>

              <div v-if="provinceDistribution.length === 0" class="empty-subtext">
                Sin datos de provincia aún.
              </div>

              <div v-else class="donut-analytics-container">
                <!-- SVG Donut Visual Chart -->
                <div class="donut-chart-box">
                  <svg viewBox="0 0 100 100" class="donut-svg">
                    <circle 
                      v-for="(slice, i) in provinceDonutSlices" 
                      :key="i"
                      cx="50" cy="50" r="38"
                      fill="none"
                      :stroke="slice.color"
                      stroke-width="16"
                      :stroke-dasharray="`${slice.dash * 2.38} ${238 - (slice.dash * 2.38)}`"
                      :stroke-dashoffset="-slice.offset * 2.38"
                    />
                  </svg>
                  <div class="donut-center-label">
                    <strong>{{ totalUsersCount }}</strong>
                    <small>Integrantes</small>
                  </div>
                </div>

                <!-- Donut Legend -->
                <div class="donut-legend-list">
                  <div v-for="item in provinceDonutSlices" :key="item.province" class="legend-item">
                    <span class="legend-color-dot" :style="{ background: item.color }"></span>
                    <span class="legend-name">{{ item.province }}</span>
                    <strong class="legend-val">{{ item.count }} ({{ item.percent }}%)</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Metric 2: Bar Chart by Shirt Size -->
            <div class="analytics-card glass-card">
              <div class="sub-block-title">
                <Shirt class="sub-icon" /> Distribución por Talla de Camiseta
              </div>

              <div v-if="sizeDistribution.length === 0" class="empty-subtext">
                Sin datos de talla registrados.
              </div>

              <div v-else class="sizes-bar-chart-list">
                <div v-for="s in sizeDistribution" :key="s.size" class="size-bar-row">
                  <div class="size-badge-box">
                    <Shirt class="badge-shirt-icon" />
                    <strong>{{ s.size }}</strong>
                  </div>
                  <div class="size-bar-flex">
                    <div class="bar-container">
                      <div class="bar-fill bg-gradient-emerald" :style="{ width: s.percent + '%' }"></div>
                    </div>
                    <span class="size-count-label">{{ s.count }} amiga{{ s.count > 1 ? 's' : '' }} ({{ s.percent }}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 4: GASTOS POR EVENTO (CRC) -->
        <div class="dashboard-block glass-card">
          <div class="block-header">
            <h3><DollarSign class="block-header-icon" /> Gastos por Evento (₡ CRC)</h3>
            <span class="badge-pink">Total ₡{{ totalExpensesSum.toLocaleString() }}</span>
          </div>

          <div class="expense-kpi-row">
            <div class="exp-kpi">
              <small>Aprobados / Verificados</small>
              <strong class="color-emerald">₡{{ approvedExpensesSum.toLocaleString() }}</strong>
            </div>
            <div class="exp-kpi">
              <small>Pendientes de Comprobante</small>
              <strong class="color-amber">₡{{ pendingExpensesSum.toLocaleString() }}</strong>
            </div>
          </div>

          <div class="sub-block-title">
            <CreditCard class="sub-icon" /> Gastos por Integrante
          </div>
          <div v-if="expensesByPayer.length === 0" class="empty-subtext">
            No hay registros de gastos aún.
          </div>
          <div v-else class="expenses-payers-list">
            <div v-for="ep in expensesByPayer" :key="ep.payer" class="payer-item">
              <span class="payer-name">{{ ep.payer }}</span>
              <strong class="payer-sum">₡{{ ep.sum.toLocaleString() }} CRC</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 5: PATROCINIOS DE EVENTOS -->
      <div class="dashboard-block glass-card sponsorships-section">
        <div class="block-header">
          <div>
            <h3><Handshake class="block-header-icon" /> Gestión & Tablero de Patrocinios</h3>
            <p class="subtitle-text">Empresas y marcas patrocinadoras de eventos BR Events</p>
          </div>
          <button @click="openAddSponsorshipModal" class="btn-primary btn-sm">
            <Plus class="btn-icon" /> Nuevo Patrocinio
          </button>
        </div>

        <div v-if="store.sponsorships.length === 0" class="empty-sponsorships">
          <p>No se han registrado patrocinios aún.</p>
          <button @click="openAddSponsorshipModal" class="btn-emerald btn-sm">Agregar el primer patrocinio</button>
        </div>

        <div v-else class="sponsorships-table-wrapper">
          <table class="sponsorships-table">
            <thead>
              <tr>
                <th>Patrocinador / Empresa</th>
                <th>Tipo</th>
                <th>Detalle / Monto</th>
                <th>Contacto</th>
                <th>Evento / Mes</th>
                <th>Estado</th>
                <th>Notas</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sp in store.sponsorships" :key="sp.id">
                <td>
                  <strong>{{ sp.sponsorName }}</strong>
                </td>
                <td>
                  <span :class="sp.type === 'Monto' ? 'badge-emerald' : 'badge-purple'">
                    {{ sp.type || 'Regalías y Productos' }}
                  </span>
                </td>
                <td>
                  <span v-if="sp.type === 'Monto' || (!sp.type && sp.amount > 0)" class="price-crc font-bold">
                    ₡{{ (Number(sp.amount) || 0).toLocaleString() }} CRC
                  </span>
                  <span v-else class="product-text">
                    <Gift class="badge-icon color-purple" /> {{ sp.productDescription || 'Regalías y Productos' }}
                  </span>
                </td>
                <td>
                  <div class="contact-box">
                    <span>{{ sp.contactName || '-' }}</span>
                    <small>{{ sp.contactPhone }}</small>
                  </div>
                </td>
                <td>
                  <span class="badge-berry">{{ sp.monthName }}</span>
                </td>
                <td>
                  <span :class="{
                    'badge-emerald': sp.status === 'Confirmado',
                    'badge-amber': sp.status === 'En negociación',
                    'badge-gray': sp.status === 'Pendiente'
                  }">
                    {{ sp.status }}
                  </span>
                </td>
                <td>
                  <small class="notes-text">{{ sp.notes || '-' }}</small>
                </td>
                <td class="text-right">
                  <div class="table-actions">
                    <button @click="openEditSponsorshipModal(sp)" class="btn-action-icon" title="Editar patrocinio">
                      <Edit class="btn-icon" />
                    </button>
                    <button @click="deleteSponsorship(sp.id)" class="btn-action-icon btn-delete" title="Eliminar patrocinio">
                      <Trash2 class="btn-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 1: INTEGRANTES -->
    <div v-if="currentTab === 'amigas'" class="tab-content glass-card">
      <div class="section-title-bar">
        <h3><Users class="block-header-icon" /> Directorio de Amigas ({{ store.friends.length }})</h3>
      </div>

      <div class="friends-table-wrapper">
        <table class="friends-table">
          <thead>
            <tr>
              <th>Amiga</th>
              <th>Contacto</th>
              <th>Talla</th>
              <th>Edad</th>
              <th>Ubicación</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in store.friends" :key="f.id">
              <td class="user-cell">
                <img v-if="f.avatar" :src="f.avatar" alt="Avatar" class="avatar-sm" />
                <div v-else class="initials-avatar-sm">{{ store.getInitials(f.name) }}</div>
                <strong>{{ f.name }}</strong>
              </td>
              <td>
                <div class="contact-box">
                  <span>{{ f.email }}</span>
                  <small>{{ f.phone }}</small>
                </div>
              </td>
              <td><span class="badge-gray">{{ f.shirtSize || 'M' }}</span></td>
              <td>{{ f.age ? f.age + ' años' : '-' }}</td>
              <td>{{ [f.province, f.canton].filter(Boolean).join(', ') || '-' }}</td>
              <td>
                <span :class="f.role?.toLowerCase() === 'admin' ? 'badge-berry' : 'badge-emerald'">
                  {{ f.role?.toLowerCase() === 'admin' ? 'Admin' : 'Integrante' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: PATROCINADORES (TABLA ORDEN ALFABÉTICO + FILTRO BÚSQUEDA) -->
    <div v-if="currentTab === 'patrocinadores'" class="tab-content glass-card">
      <div class="section-title-bar flex-header">
        <div>
          <h3><Handshake class="block-header-icon" /> Directorio de Patrocinadores ({{ filteredSponsorshipsList.length }})</h3>
          <p class="subtitle-text">Empresas y patrocinadores organizados alfabéticamente con su información de contacto y colaboraciones</p>
        </div>
        <button @click="openAddSponsorshipModal" class="btn-primary btn-sm">
          <Plus class="btn-icon" /> Registrar Patrocinador
        </button>
      </div>

      <!-- Filtro de Búsqueda por Nombre -->
      <div class="table-search-bar">
        <div class="search-input-group">
          <Search class="search-icon" />
          <input 
            v-model="sponsorSearchName" 
            type="text" 
            placeholder="Buscar patrocinador por nombre o contacto..." 
            class="form-input-sm" 
          />
        </div>
        <button v-if="sponsorSearchName" @click="sponsorSearchName = ''" class="btn-secondary btn-sm">
          Limpiar Filtro
        </button>
      </div>

      <div v-if="filteredSponsorshipsList.length === 0" class="empty-sponsorships">
        <p>No se encontraron patrocinadores con el criterio ingresado.</p>
        <button @click="openAddSponsorshipModal" class="btn-emerald btn-sm">Agregar Patrocinador</button>
      </div>

      <div v-else class="friends-table-wrapper">
        <table class="friends-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Número</th>
              <th>Tipo / Aporte</th>
              <th>Evento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredSponsorshipsList" :key="s.id">
              <td>
                <div class="user-cell">
                  <Handshake class="inline-icon color-purple" />
                  <strong>{{ s.sponsorName }}</strong>
                </div>
              </td>
              <td>{{ s.contactName || '-' }}</td>
              <td>
                <span v-if="s.contactPhone" class="phone-link">{{ s.contactPhone }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <span v-if="s.type === 'Monto' || s.amount > 0" class="badge-emerald">₡{{ (s.amount || 0).toLocaleString() }} CRC</span>
                <span v-else class="badge-purple">{{ s.productDescription || 'Regalías y Productos' }}</span>
              </td>
              <td><span class="badge-berry">{{ s.monthName || 'General' }}</span></td>
              <td>
                <div class="table-actions-only-icons">
                  <button @click="openEditSponsorshipModal(s)" class="btn-action-icon btn-edit" title="Editar patrocinador">
                    <Edit class="btn-icon" />
                  </button>
                  <button @click="deleteSponsorship(s.id)" class="btn-action-icon btn-delete" title="Eliminar patrocinador">
                    <Trash2 class="btn-icon" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: PUBLICIDAD (TABLA CON FILTROS + TOGGLE ESTADO + ACCIONES SOLO ÍCONOS) -->
    <div v-if="currentTab === 'publicidad'" class="tab-content glass-card">
      <div class="section-title-bar flex-header">
        <div>
          <h3><Megaphone class="block-header-icon" /> Gestión de Campañas de Publicidad (Banners 1200x400)</h3>
          <p class="subtitle-text">Administración en formato tabla con filtros por nombre y fecha</p>
        </div>
        <button @click="openAddAdModal" class="btn-primary btn-sm">
          <Plus class="btn-icon" /> Nueva Campaña / Banner
        </button>
      </div>

      <!-- Filtros de Búsqueda por Nombre y Fecha -->
      <div class="table-search-bar">
        <div class="search-input-group">
          <Search class="search-icon" />
          <input 
            v-model="adSearchName" 
            type="text" 
            placeholder="Buscar por nombre de negocio..." 
            class="form-input-sm" 
          />
        </div>

        <div class="search-input-group">
          <Calendar class="search-icon" />
          <input 
            v-model="adSearchDate" 
            type="date" 
            title="Filtrar por fecha de vigencia" 
            class="form-input-sm" 
          />
        </div>

        <button v-if="adSearchName || adSearchDate" @click="adSearchName = ''; adSearchDate = ''" class="btn-secondary btn-sm">
          Limpiar Filtros
        </button>
      </div>

      <div v-if="filteredAdsList.length === 0" class="empty-sponsorships">
        <p>No se encontraron campañas de publicidad con los filtros aplicados.</p>
        <button @click="openAddAdModal" class="btn-emerald btn-sm">Registrar Nueva Campaña</button>
      </div>

      <div v-else class="friends-table-wrapper">
        <table class="friends-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in filteredAdsList" :key="ad.id">
              <td>
                <div class="business-cell">
                  <strong>{{ ad.businessName }}</strong>
                  <small v-if="ad.websiteUrl" class="url-subtext">{{ ad.websiteUrl }}</small>
                </div>
              </td>
              <td>{{ ad.startDate || '-' }}</td>
              <td>{{ ad.endDate || '-' }}</td>
              <td>
                <!-- Switch Toggle para Activar / Desactivar -->
                <label class="switch-toggle" :title="ad.active ? 'Campaña Activa - Clic para desactivar' : 'Campaña Inactiva - Clic para activar'">
                  <input 
                    type="checkbox" 
                    :checked="ad.active" 
                    @change="store.toggleAdActive(ad.id)" 
                  />
                  <span class="slider-toggle"></span>
                </label>
              </td>
              <td>
                <div class="table-actions-only-icons">
                  <button @click="openViewAdModal(ad)" class="btn-action-icon btn-view" title="Ver detalles de la campaña">
                    <Eye class="btn-icon" />
                  </button>
                  <button @click="openEditAdModal(ad)" class="btn-action-icon btn-edit" title="Editar campaña">
                    <Edit class="btn-icon" />
                  </button>
                  <button @click="store.deleteAdCampaign(ad.id)" class="btn-action-icon btn-delete" title="Eliminar campaña">
                    <Trash2 class="btn-icon" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 4: GESTIÓN DE TURNERO -->
    <div v-if="currentTab === 'turnero'" class="tab-content glass-card">
      <div class="section-title-bar">
        <h3><Calendar class="block-header-icon" /> Gestión Directa del Turnero de Meses</h3>
      </div>

      <div class="admin-months-grid">
        <div v-for="m in store.months" :key="m.id" class="admin-month-card">
          <div class="month-card-header">
            <strong>#{{ m.id < 10 ? '0' + m.id : m.id }} {{ m.name }}</strong>
            <span :class="m.organizerId ? 'badge-berry' : 'badge-gray'">
              {{ m.organizerName || 'Disponible' }}
            </span>
          </div>

          <div class="month-card-body">
            <p v-if="m.theme" class="theme-text">Temática: {{ m.theme }}</p>
            <p v-else class="empty-text">Sin temática ni organizadora asignada</p>

            <div class="admin-month-actions">
              <button 
                v-if="!m.organizerId"
                @click="openAssignModal(m)"
                class="btn-emerald btn-sm"
              >
                <UserPlus class="btn-icon" /> Asignar Amiga
              </button>

              <button 
                v-else
                @click="resetMonth(m.id)"
                class="btn-secondary btn-sm"
              >
                <RotateCcw class="btn-icon" /> Liberar Mes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: GESTIÓN DE GASTOS CRC -->
    <div v-if="currentTab === 'gastos'" class="tab-content glass-card">
      <div class="section-title-bar">
        <h3><DollarSign class="block-header-icon" /> Gastos Registrados en CRC (₡ Colones)</h3>
      </div>

      <div v-if="store.expenses.length === 0" class="empty-expenses-msg">
        <p>No hay gastos registrados aún. Agrega nuevos gastos desde la sección de Gastos.</p>
      </div>

      <div v-else class="expenses-admin-list">
        <div v-for="exp in store.expenses" :key="exp.id" class="expense-admin-item">
          <div class="exp-left">
            <strong>{{ exp.description }}</strong>
            <small>Pagado por {{ exp.paidBy }} el {{ exp.date }}</small>
          </div>
          <div class="exp-right">
            <strong class="price-crc">₡{{ exp.amount.toLocaleString() }} CRC</strong>
            <button @click="deleteExpense(exp.id)" class="btn-delete" title="Eliminar gasto">
              <Trash2 class="btn-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Admin Assigning Month -->
    <div v-if="showAssignModal" class="modal-overlay" @click.self="showAssignModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Asignar Organizadora a {{ selectedMonth?.name }}</h3>
          <button @click="showAssignModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitAssign" class="admin-form">
          <div class="form-group">
            <label>Seleccionar Amiga Organizadora</label>
            <select v-model="assignForm.organizerName" required class="form-select">
              <option v-for="f in store.friends" :key="f.id" :value="f.name">
                {{ f.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Título o Temática del Evento</label>
            <input v-model="assignForm.theme" type="text" placeholder="Ej. Noche de Cocteles & Karaoke" required class="form-input" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAssignModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Asignación</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for Adding / Editing Sponsorship (Perfect CSS Box Sizing Fix) -->
    <div v-if="showSponsorshipModal" class="modal-overlay" @click.self="showSponsorshipModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>{{ isEditingSponsorship ? 'Editar Patrocinio' : 'Nuevo Patrocinio de Evento' }}</h3>
          <button @click="showSponsorshipModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitSponsorship" class="admin-form">
          <div class="form-group">
            <label>Patrocinador / Marca *</label>
            <input v-model="sponsorshipForm.sponsorName" type="text" placeholder="Ej. Floristería Bella Rosa" required class="form-input" />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Contacto Representante</label>
              <input v-model="sponsorshipForm.contactName" type="text" placeholder="Nombre de contacto" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label>Teléfono de Contacto</label>
              <input v-model="sponsorshipForm.contactPhone" type="text" placeholder="+506 8888-0000" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Mes / Evento Vinculado</label>
              <select v-model="sponsorshipForm.monthName" class="form-select">
                <option v-for="m in store.months" :key="m.id" :value="m.name">{{ m.name }}</option>
                <option value="General / Anual">General / Anual</option>
              </select>
            </div>

            <div class="form-group flex-1">
              <label>Tipo de Patrocinio *</label>
              <select v-model="sponsorshipForm.type" class="form-select">
                <option value="Regalías y Productos">Regalías y Productos</option>
                <option value="Monto">Monto (Efectivo / CRC)</option>
              </select>
            </div>
          </div>

          <!-- Dynamic Input Based on Sponsorship Type -->
          <div v-if="sponsorshipForm.type === 'Regalías y Productos'" class="form-group">
            <label>Descripción de Regalías / Productos *</label>
            <input 
              v-model="sponsorshipForm.productDescription" 
              type="text" 
              placeholder="Ej. 10 Camisetas de regalo, 2 arreglos florales, kit cosmetológico..." 
              required 
              class="form-input" 
            />
          </div>

          <div v-else-if="sponsorshipForm.type === 'Monto'" class="form-group">
            <label>Monto Total Patrocinado (₡ CRC) *</label>
            <input 
              v-model.number="sponsorshipForm.amount" 
              type="number" 
              min="0" 
              placeholder="Ej. 150000" 
              required 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label>Estado del Patrocinio</label>
            <select v-model="sponsorshipForm.status" class="form-select">
              <option value="Confirmado">Confirmado</option>
              <option value="En negociación">En negociación</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>

          <div class="form-group">
            <label>Notas / Detalles del Patrocinio</label>
            <textarea v-model="sponsorshipForm.notes" rows="3" placeholder="Detalles de la colaboración, productos, servicios o descuentos incluidos..." class="form-input"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showSponsorshipModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">{{ isEditingSponsorship ? 'Guardar Cambios' : 'Registrar Patrocinio' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Ver Detalles Completos de Campaña Publicitaria -->
    <div v-if="selectedAdForView" class="modal-overlay" @click.self="selectedAdForView = null">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3><Megaphone class="header-icon color-berry" /> Detalles de Campaña Publicitaria</h3>
          <button @click="selectedAdForView = null" class="btn-close">✕</button>
        </div>

        <div class="ad-details-view">
          <div class="ad-details-banner">
            <img :src="selectedAdForView.bannerUrl" :alt="selectedAdForView.businessName" class="ad-view-img" />
          </div>

          <div class="ad-details-info">
            <h4>{{ selectedAdForView.businessName }}</h4>
            <p class="ad-view-desc">{{ selectedAdForView.description }}</p>

            <div class="ad-info-row">
              <strong>Sitio Web / Redes:</strong>
              <a v-if="selectedAdForView.websiteUrl" :href="selectedAdForView.websiteUrl" target="_blank" rel="noopener noreferrer" class="footer-link">
                {{ selectedAdForView.websiteUrl }}
              </a>
              <span v-else>-</span>
            </div>

            <div class="ad-info-row">
              <strong>Vigencia de la Campaña:</strong>
              <span>{{ selectedAdForView.startDate }} al {{ selectedAdForView.endDate }}</span>
            </div>

            <div class="ad-info-row">
              <strong>Ubicaciones de Banners:</strong>
              <span class="badge-berry">{{ (selectedAdForView.location || 'all').toUpperCase() }}</span>
            </div>

            <div class="ad-info-row">
              <strong>Estado Actual:</strong>
              <span :class="selectedAdForView.active ? 'badge-emerald' : 'badge-gray'">
                {{ selectedAdForView.active ? 'Activa ✓' : 'Inactiva' }}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="selectedAdForView = null" class="btn-secondary">Cerrar</button>
          <button @click="openEditAdModal(selectedAdForView); selectedAdForView = null" class="btn-primary">
            <Edit class="btn-icon" /> Editar Campaña
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Adding / Requesting Ad Campaign -->
    <AdRequestModal 
      v-if="showAdRequestModal" 
      :is-admin="true"
      :ad-to-edit="adToEdit"
      @close="showAdRequestModal = false" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import AdRequestModal from './AdRequestModal.vue'
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  DollarSign, 
  UserPlus, 
  RotateCcw, 
  Trash2,
  LayoutDashboard,
  Star,
  Award,
  Handshake,
  Plus,
  Edit,
  Shirt,
  MapPin,
  Gift,
  Megaphone,
  CreditCard,
  CheckCircle2,
  XCircle,
  Search,
  Eye
} from 'lucide-vue-next'

const sponsorSearchName = ref('')
const adSearchName = ref('')
const adSearchDate = ref('')
const selectedAdForView = ref(null)
const adToEdit = ref(null)

const openAddAdModal = () => {
  adToEdit.value = null
  showAdRequestModal.value = true
}

const openEditAdModal = (ad) => {
  adToEdit.value = ad
  showAdRequestModal.value = true
}

const openViewAdModal = (ad) => {
  selectedAdForView.value = ad
}

// Filtered and Alphabetically Sorted Sponsorships List
const filteredSponsorshipsList = computed(() => {
  if (!store.sponsorships) return []
  let list = [...store.sponsorships]

  if (sponsorSearchName.value.trim()) {
    const q = sponsorSearchName.value.toLowerCase()
    list = list.filter(s => 
      (s.sponsorName && s.sponsorName.toLowerCase().includes(q)) ||
      (s.contactName && s.contactName.toLowerCase().includes(q)) ||
      (s.contactPhone && s.contactPhone.toLowerCase().includes(q))
    )
  }

  // Sort Alphabetically by sponsorName
  list.sort((a, b) => (a.sponsorName || '').localeCompare(b.sponsorName || '', 'es', { sensitivity: 'base' }))
  return list
})

// Filtered Ads List by Name and Date
const filteredAdsList = computed(() => {
  if (!store.ads) return []
  return store.ads.filter(ad => {
    const matchesName = !adSearchName.value.trim() || 
      (ad.businessName && ad.businessName.toLowerCase().includes(adSearchName.value.toLowerCase())) ||
      (ad.description && ad.description.toLowerCase().includes(adSearchName.value.toLowerCase()))
    
    const matchesDate = !adSearchDate.value.trim() || 
      (ad.startDate && ad.startDate.includes(adSearchDate.value)) || 
      (ad.endDate && ad.endDate.includes(adSearchDate.value))

    return matchesName && matchesDate
  })
})

import {
  sendAdApprovedEmail,
  sendAdRejectedEmail,
  sendSponsorshipApprovedEmail,
  sendSponsorshipRejectedEmail
} from '../lib/resend.js'

const approveAd = (ad) => {
  store.updateAdCampaign(ad.id, { status: 'approved', active: true })
  sendAdApprovedEmail(ad)
  toast.success(`Campaña de ${ad.businessName} aprobada y activada. Notificación enviada.`)
}

const rejectAd = (ad) => {
  store.updateAdCampaign(ad.id, { status: 'rejected', active: false })
  sendAdRejectedEmail(ad)
  toast.info(`Campaña de ${ad.businessName} rechazada. Notificación enviada.`)
}

const showAdRequestModal = ref(false)

const currentTab = ref('tablero')
const showAssignModal = ref(false)
const selectedMonth = ref(null)

const assignForm = reactive({
  organizerName: '',
  theme: ''
})

const adminTabs = [
  { id: 'tablero', label: 'Tablero de Reportes', icon: LayoutDashboard },
  { id: 'amigas', label: 'Integrantes', icon: Users },
  { id: 'patrocinadores', label: 'Patrocinadores', icon: Handshake },
  { id: 'publicidad', label: 'Publicidad', icon: Megaphone },
  { id: 'turnero', label: 'Gestión Turnero', icon: Calendar },
  { id: 'gastos', label: 'Gastos CRC', icon: DollarSign }
]

// --- TABLERO COMPUTED METRICS ---
const totalEvents = computed(() => store.months.length)
const assignedEventsCount = computed(() => store.months.filter(m => m.organizerId || m.theme).length)
const unassignedEventsCount = computed(() => store.months.filter(m => !m.organizerId && !m.theme).length)
const eventCoveragePercent = computed(() => Math.round((assignedEventsCount.value / (totalEvents.value || 1)) * 100))

const organizerRanking = computed(() => {
  const map = {}
  store.months.forEach(m => {
    if (m.organizerName) {
      map[m.organizerName] = (map[m.organizerName] || 0) + 1
    }
  })
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const totalReviewsCount = computed(() => store.reviews.length)
const averageRating = computed(() => {
  if (store.reviews.length === 0) return '0.0'
  const sum = store.reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
  return (sum / store.reviews.length).toFixed(1)
})

const ratingDistribution = computed(() => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  store.reviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)))
    counts[star] = (counts[star] || 0) + 1
  })
  const total = store.reviews.length || 1
  return [5, 4, 3, 2, 1].map(star => ({
    star,
    count: counts[star],
    percent: Math.round((counts[star] / total) * 100)
  }))
})

const totalUsersCount = computed(() => store.friends.length)
const sizeDistribution = computed(() => {
  const counts = {}
  store.friends.forEach(f => {
    const sz = f.shirtSize || 'M'
    counts[sz] = (counts[sz] || 0) + 1
  })
  const total = store.friends.length || 1
  return Object.entries(counts).map(([size, count]) => ({
    size,
    count,
    percent: Math.round((count / total) * 100)
  })).sort((a, b) => b.count - a.count)
})

const provinceDistribution = computed(() => {
  const counts = {}
  store.friends.forEach(f => {
    const prov = f.province || 'Por definir'
    counts[prov] = (counts[prov] || 0) + 1
  })
  return Object.entries(counts).map(([province, count]) => ({ province, count }))
    .sort((a, b) => b.count - a.count)
})

const PROVINCE_COLORS = ['#D81E5B', '#2A9D8F', '#F59E0B', '#8B5CF6', '#FF006E', '#3BCEAC', '#EC4899']

const provinceDonutSlices = computed(() => {
  const total = totalUsersCount.value || 1
  let cumulative = 0
  return provinceDistribution.value.map((item, idx) => {
    const percent = item.count / total
    const dash = Math.round(percent * 100)
    const offset = Math.round(cumulative * 100)
    cumulative += percent
    return {
      province: item.province,
      count: item.count,
      percent: Math.round(percent * 100),
      dash,
      offset,
      color: PROVINCE_COLORS[idx % PROVINCE_COLORS.length]
    }
  })
})

const totalExpensesSum = computed(() => {
  return store.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
})

const approvedExpensesSum = computed(() => {
  return store.expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
})

const pendingExpensesSum = computed(() => {
  return store.expenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
})

const avgExpensePerUser = computed(() => {
  const users = store.friends.length || 1
  return Math.round(totalExpensesSum.value / users)
})

const expensesByPayer = computed(() => {
  const map = {}
  store.expenses.forEach(e => {
    const payer = e.paidBy || 'Anónimo'
    map[payer] = (map[payer] || 0) + Number(e.amount)
  })
  return Object.entries(map).map(([payer, sum]) => ({ payer, sum }))
    .sort((a, b) => b.sum - a.sum)
})

const totalSponsorshipsSum = computed(() => {
  return store.sponsorships.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
})

const confirmedSponsorshipsCount = computed(() => {
  return store.sponsorships.filter(s => s.status === 'Confirmado').length
})

const negotiatingSponsorshipsCount = computed(() => {
  return store.sponsorships.filter(s => s.status === 'En negociación').length
})

const groupedSponsorships = computed(() => {
  const map = {}
  store.sponsorships.forEach(sp => {
    const key = sp.sponsorName.trim().toLowerCase()
    if (!map[key]) {
      map[key] = {
        sponsorName: sp.sponsorName,
        contactName: sp.contactName,
        contactPhone: sp.contactPhone,
        totalAmount: 0,
        productsList: [],
        items: []
      }
    }
    if (sp.type === 'Monto' || (!sp.type && sp.amount > 0)) {
      map[key].totalAmount += Number(sp.amount) || 0
    }
    if (sp.productDescription) {
      map[key].productsList.push(sp.productDescription)
    }
    map[key].items.push(sp)
    if (!map[key].contactName && sp.contactName) map[key].contactName = sp.contactName
    if (!map[key].contactPhone && sp.contactPhone) map[key].contactPhone = sp.contactPhone
  })
  return Object.values(map)
})

// --- SPONSORSHIP MODAL LOGIC ---
const showSponsorshipModal = ref(false)
const isEditingSponsorship = ref(false)
const editingSponsorshipId = ref(null)

const sponsorshipForm = reactive({
  sponsorName: '',
  contactName: '',
  contactPhone: '',
  monthName: 'Enero',
  type: 'Regalías y Productos',
  productDescription: '',
  amount: 0,
  status: 'Confirmado',
  notes: ''
})

const openAddSponsorshipModal = () => {
  isEditingSponsorship.value = false
  editingSponsorshipId.value = null
  Object.assign(sponsorshipForm, {
    sponsorName: '',
    contactName: '',
    contactPhone: '',
    monthName: 'Enero',
    type: 'Regalías y Productos',
    productDescription: '',
    amount: 0,
    status: 'Confirmado',
    notes: ''
  })
  showSponsorshipModal.value = true
}

const openEditSponsorshipModal = (sp) => {
  isEditingSponsorship.value = true
  editingSponsorshipId.value = sp.id
  Object.assign(sponsorshipForm, {
    sponsorName: sp.sponsorName,
    contactName: sp.contactName,
    contactPhone: sp.contactPhone,
    monthName: sp.monthName,
    type: sp.type || (sp.productDescription ? 'Regalías y Productos' : 'Monto'),
    productDescription: sp.productDescription || '',
    amount: sp.amount || 0,
    status: sp.status,
    notes: sp.notes
  })
  showSponsorshipModal.value = true
}

const submitSponsorship = () => {
  if (!sponsorshipForm.sponsorName.trim()) {
    toast.warning('Por favor ingresa el nombre de la empresa o patrocinador')
    return
  }

  if (isEditingSponsorship.value && editingSponsorshipId.value) {
    store.updateSponsorship(editingSponsorshipId.value, sponsorshipForm)
    if (sponsorshipForm.status === 'Confirmado') {
      sendSponsorshipApprovedEmail(sponsorshipForm)
    } else if (sponsorshipForm.status === 'Rechazado') {
      sendSponsorshipRejectedEmail(sponsorshipForm)
    }
  } else {
    store.addSponsorship(sponsorshipForm)
  }
  showSponsorshipModal.value = false
}

const deleteSponsorship = (id) => {
  if (confirm('¿Deseas eliminar este registro de patrocinio?')) {
    store.deleteSponsorship(id)
  }
}

// --- ADMIN ACTIONS ---
const openAssignModal = (month) => {
  selectedMonth.value = month
  assignForm.organizerName = store.friends[0]?.name || ''
  assignForm.theme = ''
  showAssignModal.value = true
}

const submitAssign = () => {
  if (selectedMonth.value) {
    store.adminAssignMonth(selectedMonth.value.id, assignForm.organizerName, assignForm.theme)
    showAssignModal.value = false
    toast.success(`Mes ${selectedMonth.value.name} asignado exitosamente a ${assignForm.organizerName}`)
  }
}

const resetMonth = (monthId) => {
  if (confirm('¿Deseas liberar este mes y dejarlo disponible nuevamente?')) {
    store.adminResetMonth(monthId)
  }
}

const deleteExpense = (expId) => {
  if (confirm('¿Deseas eliminar este registro de gasto?')) {
    store.deleteExpense(expId)
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1400px;
  margin: 24px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-header {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-top-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.badge-icon {
  width: 14px;
  height: 14px;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.admin-tab-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-soft);
  color: var(--color-text-muted);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 0.88rem;
  font-family: var(--font-heading);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.admin-tab-btn.active {
  background: var(--gradient-berry);
  color: white;
  border-color: transparent;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(216, 30, 91, 0.3);
}

.tab-icon {
  width: 16px;
  height: 16px;
}

/* ====================================================================
   TABLERO / DASHBOARD STYLES
   ==================================================================== */
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* KPI Cards Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.kpi-card {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: var(--radius-md);
  transition: transform 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.border-berry { border-left: 4px solid var(--color-berry); }
.border-amber { border-left: 4px solid #f59e0b; }
.border-emerald { border-left: 4px solid var(--color-emerald); }
.border-pink { border-left: 4px solid var(--color-pink-vivid); }
.border-purple { border-left: 4px solid #8b5cf6; }

.kpi-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-berry-glow { background: rgba(216, 30, 91, 0.15); }
.bg-amber-glow { background: rgba(245, 158, 11, 0.15); }
.bg-emerald-glow { background: rgba(42, 157, 143, 0.15); }
.bg-pink-glow { background: rgba(255, 0, 110, 0.15); }
.bg-purple-glow { background: rgba(139, 92, 246, 0.15); }

.kpi-icon { width: 22px; height: 22px; }
.color-berry { color: var(--color-berry); }
.color-amber { color: #f59e0b; }
.color-emerald { color: var(--color-emerald); }
.color-pink { color: var(--color-pink-vivid); }
.color-purple { color: #8b5cf6; }

.kpi-details {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.76rem;
  color: var(--color-text-dim);
  font-family: var(--font-heading);
}

.kpi-value {
  font-size: 1.25rem;
  font-family: var(--font-heading);
  color: var(--color-text-main);
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-inline {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.3);
}

.star-inline.filled {
  color: #f59e0b;
  fill: #f59e0b;
}

.hero-star-icon {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.2);
}

.hero-star-icon.filled {
  color: #f59e0b;
  fill: #f59e0b;
}

.kpi-subtext {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* Dashboard Sections Grid */
.dashboard-sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .dashboard-sections-grid {
    grid-template-columns: 1fr;
  }
}

.dashboard-block {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.full-width-block {
  grid-column: 1 / -1;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 12px;
}

.flex-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.block-header h3 {
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-main);
}

.block-header-icon {
  width: 18px;
  height: 18px;
  color: var(--color-berry);
}

.subtitle-text {
  font-size: 0.8rem;
  color: var(--color-text-dim);
}

.sub-block-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.sub-icon { width: 15px; height: 15px; color: var(--color-berry); }

.empty-subtext {
  font-size: 0.8rem;
  color: var(--color-text-dim);
  font-style: italic;
}

/* Event Progress Section */
.event-progress-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
}

.progress-bar-bg {
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--gradient-berry);
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

/* Organizers Ranking */
.organizers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.organizer-rank-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
}

.rank-badge {
  font-weight: 900;
  font-size: 0.8rem;
  color: var(--color-berry);
}

.rank-name {
  font-size: 0.85rem;
  font-weight: 600;
}

/* Reviews Summary Box */
.rating-summary-box {
  display: flex;
  gap: 20px;
  align-items: center;
}

@media (max-width: 480px) {
  .rating-summary-box {
    flex-direction: column;
  }
}

.rating-score-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background: rgba(245, 158, 11, 0.08);
  border-radius: var(--radius-md);
  border: 1px solid rgba(245, 158, 11, 0.2);
  min-width: 120px;
}

.score-num {
  font-size: 2rem;
  font-weight: 900;
  color: #f59e0b;
  line-height: 1;
}

.stars-row {
  display: flex;
  gap: 2px;
  margin: 4px 0;
}

.rating-bars-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rating-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
}

.star-label {
  width: 38px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 2px;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #f59e0b;
  border-radius: var(--radius-full);
}

.bar-count {
  font-size: 0.75rem;
  color: var(--color-text-dim);
  min-width: 55px;
  text-align: right;
}

.mini-reviews-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-review-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
}

.rev-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.rev-stars { display: flex; gap: 2px; }
.rev-comment { font-size: 0.78rem; color: var(--color-text-muted); font-style: italic; margin-top: 2px; }

/* User Analytics Grid (Separate Dedicated Cards) */
.user-analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.analytics-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Donut SVG Chart Box */
.donut-analytics-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

@media (max-width: 480px) {
  .donut-analytics-container {
    flex-direction: column;
  }
}

.donut-chart-box {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-center-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.donut-center-label strong {
  font-size: 1.3rem;
  line-height: 1;
  font-family: var(--font-heading);
}

.donut-center-label small {
  font-size: 0.7rem;
  color: var(--color-text-dim);
}

.donut-legend-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.legend-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  color: var(--color-text-muted);
}

.legend-val {
  color: var(--color-text-main);
  font-size: 0.82rem;
}

/* Shirt Sizes Bar Chart */
.sizes-bar-chart-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.size-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-badge-box {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(42, 157, 143, 0.15);
  border: 1px solid rgba(42, 157, 143, 0.3);
  padding: 4px 10px;
  border-radius: var(--radius-md);
  min-width: 50px;
  justify-content: center;
}

.badge-shirt-icon {
  width: 14px;
  height: 14px;
  color: var(--color-emerald);
}

.size-bar-flex {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bg-gradient-emerald {
  background: var(--gradient-emerald) !important;
}

.size-count-label {
  font-size: 0.75rem;
  color: var(--color-text-dim);
}

/* Expenses Dashboard */
.expense-kpi-row {
  display: flex;
  gap: 12px;
}

.exp-kpi {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  padding: 10px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid var(--border-glass);
}

.exp-kpi small { font-size: 0.75rem; color: var(--color-text-dim); }
.exp-kpi strong { font-size: 1rem; }

.expenses-payers-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.payer-item {
  display: flex;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  border: 1px solid var(--border-glass);
}

/* Sponsorships Table Section */
.sponsorships-section {
  margin-top: 10px;
}

.empty-sponsorships {
  text-align: center;
  padding: 30px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.sponsorships-table-wrapper {
  overflow-x: auto;
}

.sponsorships-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.sponsorships-table th {
  padding: 10px 12px;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--border-glass);
  font-family: var(--font-heading);
}

.sponsorships-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-glass);
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.btn-action-icon {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-soft);
  color: var(--color-text-main);
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-action-icon:hover {
  background: var(--color-berry);
  color: white;
}

.notes-text {
  color: var(--color-text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Table Search Bar & Filters */
.table-search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 14px;
  height: 14px;
  color: var(--color-text-dim);
  pointer-events: none;
}

.form-input-sm {
  background: var(--color-bg-input);
  color: var(--color-text-main);
  border: 1px solid var(--border-soft);
  padding: 8px 12px 8px 34px;
  border-radius: var(--radius-md);
  width: 100%;
  font-size: 0.85rem;
}

.table-actions-only-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-view:hover {
  background: var(--color-emerald) !important;
  color: white !important;
}

.btn-edit:hover {
  background: #f59e0b !important;
  color: white !important;
}

.btn-delete:hover {
  background: var(--color-berry) !important;
  color: white !important;
}

.business-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.url-subtext {
  font-size: 0.72rem;
  color: var(--color-pink-vivid);
  word-break: break-all;
}

.phone-link {
  color: var(--color-emerald);
  font-weight: 600;
}

/* Switch Toggle Control */
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.switch-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider-toggle {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.15);
  transition: .3s ease;
  border-radius: 34px;
  border: 1px solid var(--border-soft);
}

.slider-toggle:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s ease;
  border-radius: 50%;
}

input:checked + .slider-toggle {
  background: var(--gradient-emerald);
}

input:checked + .slider-toggle:before {
  transform: translateX(20px);
}

/* Ad Details View Modal */
.ad-details-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ad-details-banner {
  width: 100%;
  aspect-ratio: 3 / 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-soft);
  background: black;
}

.ad-view-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ad-details-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ad-details-info h4 {
  font-size: 1.2rem;
  color: var(--color-text-main);
}

.ad-view-desc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.ad-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-glass);
}

.product-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
}

/* Grouped Sponsors Tab */
.sponsors-grouped-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.sponsor-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sponsor-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 10px;
}

.sponsor-brand-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.sponsor-icon { width: 20px; height: 20px; }

.sponsor-card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 0.84rem;
}

.sponsor-contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--color-text-muted);
}

.sponsor-summary-totals {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  padding: 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
}

.total-badge-item, .products-badge-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.products-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.sponsor-events-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-title { color: var(--color-text-dim); }

.events-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* Ad Campaigns Grid (Publicidad Tab) */
.ads-campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  margin-top: 12px;
}

.ad-campaign-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ad-card-banner-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 1;
  overflow: hidden;
  background: #000;
}

.ad-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ad-card-overlay-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ad-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ad-card-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ad-card-header strong {
  font-size: 1.05rem;
  color: var(--color-text-main);
}

.dates-text {
  font-size: 0.76rem;
  color: var(--color-text-dim);
}

.ad-card-desc {
  font-size: 0.84rem;
  color: var(--color-text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ad-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--border-glass);
}

/* Publicidad Placeholder Card */
.publicidad-placeholder-card {
  text-align: center;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.promo-icon-box {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(216, 30, 91, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(216, 30, 91, 0.3);
}

.promo-hero-icon { width: 36px; height: 36px; }

.publicidad-placeholder-card h4 {
  font-size: 1.3rem;
  color: var(--color-text-main);
}

.publicidad-placeholder-card p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.placeholder-actions {
  margin-top: 8px;
}

/* Standard Tab Content */
.tab-content {
  padding: 24px;
}

.section-title-bar {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 12px;
}

/* Table */
.friends-table-wrapper {
  overflow-x: auto;
}

.friends-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
}

.friends-table th {
  padding: 12px;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--border-glass);
  font-family: var(--font-heading);
}

.friends-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-glass);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.initials-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-berry);
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-box {
  display: flex;
  flex-direction: column;
}

.contact-box small {
  color: var(--color-text-dim);
}

/* Admin Months Grid */
.admin-months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.admin-month-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.month-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-text {
  font-size: 0.82rem;
  color: var(--color-berry);
}

.empty-text {
  font-size: 0.78rem;
  color: var(--color-text-dim);
  font-style: italic;
}

.admin-month-actions {
  margin-top: 6px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Expenses Admin */
.empty-expenses-msg {
  text-align: center;
  padding: 30px;
  color: var(--color-text-muted);
}

.expenses-admin-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expense-admin-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-glass);
}

.exp-left {
  display: flex;
  flex-direction: column;
}

.exp-left small {
  color: var(--color-text-dim);
}

.exp-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.price-crc {
  font-family: var(--font-heading);
  color: var(--color-emerald);
}

.font-bold { font-weight: 700; }

.btn-delete {
  background: rgba(216, 30, 91, 0.2);
  color: var(--color-pink-vivid);
  border: 1px solid rgba(216, 30, 91, 0.3);
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
}

/* Modal Box Sizing & Overflow Fix */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  padding: 24px;
  background: var(--color-bg-card);
  box-sizing: border-box; /* Fix overflow */
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
}

.flex-1 { 
  flex: 1; 
  min-width: 0; /* CRITICAL: Prevents flex child from exceeding container */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.form-group label {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.form-input, .form-select {
  background: var(--color-bg-input);
  color: var(--color-text-main);
  border: 1px solid var(--border-soft);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  width: 100%;
  box-sizing: border-box; /* CRITICAL: Includes padding in 100% width calculation */
  max-width: 100%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.text-right { text-align: right; }
</style>
