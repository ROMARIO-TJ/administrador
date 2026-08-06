<template>
  <div class="reports-container">
    <!-- CABECERA PRINCIPAL -->
    <div class="reports-header">
      <div>
        <h2 class="page-title">Módulo de Reportes & Informes</h2>
        <p class="page-subtitle">Consultas operacionales y contables en tiempo real — Unión Jaguera FC</p>
      </div>

      <div class="header-export-actions" v-if="hasDataToExport">
        <button type="button" class="btn btn-excel" @click="handleExcelExport" title="Exportar a Excel (.xlsx/csv)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Exportar Excel
        </button>
        <button type="button" class="btn btn-pdf" @click="handlePdfExport" title="Vista PDF / Imprimir con membrete">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          Exportar PDF
        </button>
        <button type="button" class="btn btn-print" @click="handlePrint" title="Imprimir reporte actual">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Imprimir
        </button>
      </div>
    </div>

    <!-- NAVEGACIÓN DE 7 PESTAÑAS -->
    <div class="tabs-nav-bar card-modern">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        :class="['tab-nav-btn', activeTab === t.id ? 'active' : '', t.badgeClass || '']"
        @click="switchTab(t.id)"
      >
        <span class="tab-icon" v-html="t.icon"></span>
        <span class="tab-label">{{ t.label }}</span>
        <span v-if="t.count !== undefined" class="tab-count-badge">{{ t.count }}</span>
      </button>
    </div>

    <!-- CONTENIDO SEGÚN LA PESTAÑA ACTIVA -->
    <div class="tab-content-wrapper">

      <!-- ================= PESTAÑA 1: 👥 ALUMNOS ================= -->
      <div v-if="activeTab === 'students'" class="report-tab-panel">
        <div class="filter-card card-modern">
          <div class="filters-grid-4">
            <div class="search-box">
              <input type="text" v-model="filters.students.search" placeholder="Buscar por alumno, documento o código..." class="form-control" @input="debounceStudents" />
            </div>
            <select v-model="filters.students.categoryId" class="form-control" @change="loadStudentsReport">
              <option value="">Todas las Categorías</option>
              <option v-for="c in categoriesList" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select v-model="filters.students.status" class="form-control" @change="loadStudentsReport">
              <option value="">Todos los Estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
            <select v-model="filters.students.gender" class="form-control" @change="loadStudentsReport">
              <option value="">Todos los Sexos</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </select>
          </div>
        </div>

        <div v-if="reportStore.loading" class="loading-state card-modern">
          <div class="spinner"></div>
          <p>Consultando listado general de alumnos...</p>
        </div>

        <div v-else-if="!reportStore.studentsReport.data || reportStore.studentsReport.data.length === 0" class="empty-state card-modern">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3>No existen reportes disponibles.</h3>
          <p>No existen alumnos registrados para mostrar en este reporte.</p>
        </div>

        <div v-else class="table-card card-modern">
          <div class="table-summary-header">
            <span>Total Alumnos: <strong>{{ reportStore.studentsReport.summary.totalStudents || 0 }}</strong></span>
            <span>Activos: <strong class="text-success">{{ reportStore.studentsReport.summary.activeCount || 0 }}</strong></span>
            <span>Inactivos: <strong class="text-danger">{{ reportStore.studentsReport.summary.inactiveCount || 0 }}</strong></span>
            <span>Masculinos: <strong>{{ reportStore.studentsReport.summary.maleCount || 0 }}</strong></span>
            <span>Femeninos: <strong>{{ reportStore.studentsReport.summary.femaleCount || 0 }}</strong></span>
          </div>

          <div class="table-responsive" id="students-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Alumno</th>
                  <th>Documento</th>
                  <th>Categoría</th>
                  <th>Edad</th>
                  <th>Sexo</th>
                  <th>Estado</th>
                  <th>Acudiente</th>
                  <th>Teléfono</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="st in reportStore.studentsReport.data" :key="st.id">
                  <td class="font-mono font-bold text-primary">{{ st.code }}</td>
                  <td class="font-semibold">{{ st.fullName }}</td>
                  <td>{{ st.document }}</td>
                  <td><span class="category-pill">{{ st.categoryName }}</span></td>
                  <td>{{ st.age }} años</td>
                  <td>{{ st.gender }}</td>
                  <td>
                    <span :class="['badge', st.status === 'ACTIVE' ? 'badge-success' : 'badge-danger']">
                      {{ st.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO' }}
                    </span>
                  </td>
                  <td>{{ st.guardianName }} ({{ st.guardianRelationship }})</td>
                  <td class="font-mono">{{ st.guardianPhone }}</td>
                  <td>
                    <button type="button" class="btn-action-sm" @click="viewStudentReport(st.id)">
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= PESTAÑA 2: 💰 MENSUALIDADES ================= -->
      <div v-else-if="activeTab === 'monthly'" class="report-tab-panel">
        <div class="filter-card card-modern">
          <div class="filters-grid-3">
            <div class="search-box">
              <input type="text" v-model="filters.monthly.search" placeholder="Buscar por alumno o documento..." class="form-control" @input="debounceMonthly" />
            </div>
            <select v-model="filters.monthly.categoryId" class="form-control" @change="loadMonthlyReport">
              <option value="">Todas las Categorías</option>
              <option v-for="c in categoriesList" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select v-model="filters.monthly.year" class="form-control" @change="loadMonthlyReport">
              <option v-for="y in availableYears" :key="y" :value="y">Año {{ y }}</option>
            </select>
          </div>
        </div>

        <div v-if="reportStore.loading" class="loading-state card-modern">
          <div class="spinner"></div>
          <p>Generando matriz de mensualidades de la academia...</p>
        </div>

        <div v-else class="table-card card-modern">
          <div class="matrix-legend-bar">
            <span>Leyenda:</span>
            <span class="legend-item"><span class="dot paid"></span> 🟢 Pagado</span>
            <span class="legend-item"><span class="dot pending"></span> 🟡 Mes Actual Pendiente</span>
            <span class="legend-item"><span class="dot overdue"></span> 🔴 Vencido</span>
            <span class="legend-item"><span class="dot future"></span> 🔵 Próximo</span>
          </div>

          <div class="table-responsive" id="monthly-table-container">
            <table class="data-table matrix-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Alumno</th>
                  <th>Categoría</th>
                  <th v-for="m in monthHeaders" :key="m">{{ m }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in reportStore.monthlyReport.matrix" :key="row.studentId">
                  <td class="font-mono font-bold text-primary">{{ row.code }}</td>
                  <td class="font-semibold">{{ row.fullName }}</td>
                  <td><span class="category-pill">{{ row.categoryName }}</span></td>
                  <td v-for="m in row.months" :key="m.month" class="text-center">
                    <span
                      :class="['matrix-cell-badge', getMatrixCellClass(m.status)]"
                      :title="m.isPaid ? `${m.monthName}: Pagado ${formatCurrency(m.amount)} (${m.consecutive})` : `${m.monthName}: ${m.status}`"
                    >
                      {{ getMatrixCellIcon(m.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= PESTAÑA 3: 🚨 MOROSOS ================= -->
      <div v-else-if="activeTab === 'debtors'" class="report-tab-panel">
        <!-- KPIs DE ALERTA -->
        <div class="debtors-kpi-grid">
          <div class="debtors-kpi-card card-modern alert-card-danger">
            <div class="kpi-icon-danger">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div>
              <span class="kpi-title-danger">Total Saldo Pendiente</span>
              <h2 class="kpi-value-danger">{{ formatCurrency(reportStore.debtorsReport.summary.totalPendingDebt || 0) }}</h2>
              <span class="kpi-subtext">Sumatoria acumulada de carteras vencidas</span>
            </div>
          </div>

          <div class="debtors-kpi-card card-modern alert-card-warning">
            <div class="kpi-icon-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <span class="kpi-title-warning">Número de Alumnos Morosos</span>
              <h2 class="kpi-value-warning">{{ reportStore.debtorsReport.summary.totalDebtorsCount || 0 }} Alumnos</h2>
              <span class="kpi-subtext">Con matricula o meses pendientes</span>
            </div>
          </div>

          <div class="debtors-kpi-card card-modern">
            <div>
              <span class="kpi-title-muted">Porcentaje de Recaudo</span>
              <h2 class="kpi-value-success">{{ reportStore.debtorsReport.summary.collectionPercentage || 0 }}%</h2>
              <span class="kpi-subtext">Esperado vs Recaudado</span>
            </div>
          </div>
        </div>

        <div class="filter-card card-modern">
          <div class="filters-grid-2">
            <div class="search-box">
              <input type="text" v-model="filters.debtors.search" placeholder="Buscar alumno moroso..." class="form-control" @input="debounceDebtors" />
            </div>
            <select v-model="filters.debtors.categoryId" class="form-control" @change="loadDebtorsReport">
              <option value="">Todas las Categorías</option>
              <option v-for="c in categoriesList" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
        </div>

        <div v-if="reportStore.loading" class="loading-state card-modern">
          <div class="spinner"></div>
          <p>Buscando alumnos morosos y carteras pendientes...</p>
        </div>

        <div v-else-if="reportStore.debtorsReport.debtors.length === 0" class="empty-state card-modern">
          <div class="empty-icon-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3>No existen alumnos morosos.</h3>
          <p>Todos los alumnos están al día con sus mensualidades e inscripciones.</p>
        </div>

        <div v-else class="table-card card-modern">
          <div class="table-responsive" id="debtors-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Alumno</th>
                  <th>Categoría</th>
                  <th>Acudiente / Teléfono</th>
                  <th>Inscripción</th>
                  <th>Meses Pendientes</th>
                  <th>Valor Pendiente</th>
                  <th>Último Pago</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in reportStore.debtorsReport.debtors" :key="d.studentId">
                  <td class="font-mono font-bold text-primary">{{ d.code }}</td>
                  <td class="font-semibold">{{ d.fullName }}</td>
                  <td><span class="category-pill">{{ d.categoryName }}</span></td>
                  <td>{{ d.guardianName }} ({{ d.guardianPhone }})</td>
                  <td>
                    <span :class="['badge', d.isRegistrationPaid ? 'badge-success' : 'badge-danger']">
                      {{ d.isRegistrationPaid ? 'Pagada' : 'Pendiente' }}
                    </span>
                  </td>
                  <td>
                    <span v-if="d.pendingMonths.length > 0" class="badge badge-warning">
                      {{ d.pendingMonths.join(', ') }} ({{ d.pendingMonthsCount }})
                    </span>
                    <span v-else class="text-muted">Ninguno</span>
                  </td>
                  <td class="font-bold text-danger font-mono text-lg">{{ formatCurrency(d.totalPending) }}</td>
                  <td>
                    <template v-if="d.lastPayment">
                      <div class="last-pay-info">
                        <strong>{{ formatCurrency(d.lastPayment.amount) }}</strong>
                        <span>{{ formatDate(d.lastPayment.date) }}</span>
                      </div>
                    </template>
                    <span v-else class="text-muted">Sin pagos registrados</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= PESTAÑA 4: 📈 INGRESOS ================= -->
      <div v-else-if="activeTab === 'income'" class="report-tab-panel">
        <div class="income-kpis-grid">
          <KpiCard title="Ingresos de Hoy" :value="formatCurrency(reportStore.incomeReport.kpis.todayIncome)" subtitle="Recaudo del día" iconBgColor="#DCFCE7" iconColor="#16A34A" />
          <KpiCard title="Ingresos de la Semana" :value="formatCurrency(reportStore.incomeReport.kpis.weekIncome)" subtitle="Lunes a Domingo" iconBgColor="#EFF6FF" iconColor="#2563EB" />
          <KpiCard title="Ingresos del Mes" :value="formatCurrency(reportStore.incomeReport.kpis.monthIncome)" subtitle="Recaudo mensual" iconBgColor="#FEF3C7" iconColor="#D97706" />
          <KpiCard title="Ingresos del Año" :value="formatCurrency(reportStore.incomeReport.kpis.yearIncome)" subtitle="Año en curso" iconBgColor="#F3E8FF" iconColor="#9333EA" />
        </div>

        <div class="filter-card card-modern">
          <div class="filters-flex">
            <div class="filter-group">
              <label class="filter-label">Período:</label>
              <select v-model="filters.income.period" class="form-control" @change="loadIncomeReport">
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="year">Este Año</option>
                <option value="custom">Rango Personalizado</option>
              </select>
            </div>

            <template v-if="filters.income.period === 'custom'">
              <div class="filter-group">
                <label class="filter-label">Desde:</label>
                <input type="date" v-model="filters.income.startDate" class="form-control" @change="loadIncomeReport" />
              </div>
              <div class="filter-group">
                <label class="filter-label">Hasta:</label>
                <input type="date" v-model="filters.income.endDate" class="form-control" @change="loadIncomeReport" />
              </div>
            </template>
          </div>
        </div>

        <div v-if="reportStore.loading" class="loading-state card-modern">
          <div class="spinner"></div>
          <p>Calculando estadísticas de ingresos en tiempo real desde PostgreSQL...</p>
        </div>

        <div v-else class="income-breakdown-grid" id="income-table-container">
          <!-- Desglose por Concepto -->
          <div class="income-card card-modern">
            <h3>Ingresos por Concepto</h3>
            <div class="breakdown-list">
              <div class="breakdown-item">
                <div class="item-label">
                  <span>Mensualidades</span>
                  <strong>{{ formatCurrency(reportStore.incomeReport.filteredPeriod.monthlyPaymentsAmount || 0) }}</strong>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill green" :style="{ width: getPercentageStr(reportStore.incomeReport.filteredPeriod.monthlyPaymentsAmount, reportStore.incomeReport.filteredPeriod.totalCollected) }"></div>
                </div>
              </div>

              <div class="breakdown-item">
                <div class="item-label">
                  <span>Inscripciones / Matrículas</span>
                  <strong>{{ formatCurrency(reportStore.incomeReport.filteredPeriod.registrationsAmount || 0) }}</strong>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill blue" :style="{ width: getPercentageStr(reportStore.incomeReport.filteredPeriod.registrationsAmount, reportStore.incomeReport.filteredPeriod.totalCollected) }"></div>
                </div>
              </div>
            </div>
            <div class="total-bar font-bold">
              <span>Total Recaudado en Período:</span>
              <span class="text-success text-xl">{{ formatCurrency(reportStore.incomeReport.filteredPeriod.totalCollected || 0) }}</span>
            </div>
          </div>

          <!-- Desglose por Método de Pago -->
          <div class="income-card card-modern">
            <h3>Ingresos por Método de Pago</h3>
            <div class="breakdown-list" v-if="reportStore.incomeReport.filteredPeriod.byMethod">
              <div
                v-for="(amount, method) in reportStore.incomeReport.filteredPeriod.byMethod"
                :key="method"
                class="breakdown-item"
              >
                <div class="item-label">
                  <span>{{ formatMethod(method) }}</span>
                  <strong>{{ formatCurrency(amount) }}</strong>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill purple" :style="{ width: getPercentageStr(amount, reportStore.incomeReport.filteredPeriod.totalCollected) }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= PESTAÑA 5: 🏆 CATEGORÍAS ================= -->
      <div v-else-if="activeTab === 'categories'" class="report-tab-panel">
        <div v-if="reportStore.loading" class="loading-state card-modern">
          <div class="spinner"></div>
          <p>Consultando métricas operacionales por categoría deportiva...</p>
        </div>

        <div v-else class="table-card card-modern">
          <div class="table-responsive" id="categories-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Total Alumnos</th>
                  <th>Activos</th>
                  <th>Inactivos</th>
                  <th>Esperado Mensual</th>
                  <th>Recaudado Este Mes</th>
                  <th>% Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in reportStore.categoriesReport.categories" :key="c.categoryId">
                  <td class="font-bold text-primary">{{ c.name }}</td>
                  <td class="text-muted">{{ c.description || 'Sin descripción' }}</td>
                  <td class="font-bold text-center">{{ c.totalStudents }}</td>
                  <td class="text-success font-bold text-center">{{ c.activeStudents }}</td>
                  <td class="text-danger text-center">{{ c.inactiveStudents }}</td>
                  <td class="font-semibold">{{ formatCurrency(c.expectedMonthlyIncome) }}</td>
                  <td class="font-bold text-success">{{ formatCurrency(c.collectedThisMonth) }}</td>
                  <td>
                    <div class="badge-percentage-box">
                      <span :class="['badge', c.collectionPercentage >= 80 ? 'badge-success' : 'badge-warning']">
                        {{ c.collectionPercentage }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= PESTAÑA 6: 📝 INSCRIPCIONES ================= -->
      <div v-else-if="activeTab === 'registrations'" class="report-tab-panel">
        <div class="filter-card card-modern">
          <div class="filters-flex">
            <input type="text" v-model="filters.registrations.search" placeholder="Buscar por consecutivo, alumno..." class="form-control" @input="debounceRegistrations" />
            <select v-model="filters.registrations.paymentMethod" class="form-control" @change="loadRegistrationsReport">
              <option value="ALL">Todos los Métodos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="NEQUI">Nequi</option>
              <option value="DAVIPLATA">Daviplata</option>
            </select>
          </div>
        </div>

        <div v-if="reportStore.loading" class="loading-state card-modern">
          <div class="spinner"></div>
          <p>Consultando historial de inscripciones y matrículas...</p>
        </div>

        <div v-else-if="!reportStore.registrationsReport.registrations || reportStore.registrationsReport.registrations.length === 0" class="empty-state card-modern">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3>No existen inscripciones registradas.</h3>
          <p>No hay registros de inscripciones para el filtro o período seleccionado.</p>
        </div>

        <div v-else class="table-card card-modern">
          <div class="table-responsive" id="registrations-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Consecutivo</th>
                  <th>Alumno</th>
                  <th>Documento</th>
                  <th>Categoría</th>
                  <th>Fecha de Pago</th>
                  <th>Método</th>
                  <th>Valor</th>
                  <th>Registrado Por</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reportStore.registrationsReport.registrations" :key="r.id">
                  <td class="font-mono font-bold text-primary">{{ r.consecutive }}</td>
                  <td class="font-semibold">{{ r.studentName }}</td>
                  <td>{{ r.studentDocument }}</td>
                  <td><span class="category-pill">{{ r.categoryName }}</span></td>
                  <td>{{ formatDate(r.paymentDate) }}</td>
                  <td><span class="method-tag">{{ formatMethod(r.paymentMethod) }}</span></td>
                  <td class="font-bold text-success">{{ formatCurrency(r.amount) }}</td>
                  <td class="text-muted text-sm">{{ r.registeredBy || 'Administrador' }}</td>
                  <td class="notes-cell">{{ r.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= PESTAÑA 7: 📚 MOVIMIENTOS ================= -->
      <div v-else-if="activeTab === 'movements'" class="report-tab-panel">
        <div class="filter-card card-modern">
          <div class="filters-flex">
            <input type="text" v-model="filters.movements.search" placeholder="Buscar movimiento..." class="form-control" @input="debounceMovements" />
            <select v-model="filters.movements.type" class="form-control" @change="loadMovementsReport">
              <option value="ALL">Todos los Movimientos</option>
              <option value="INSCRIPCION">Inscripciones</option>
              <option value="MENSUALIDAD">Mensualidades</option>
            </select>
            <select v-model="filters.movements.paymentMethod" class="form-control" @change="loadMovementsReport">
              <option value="ALL">Todos los Métodos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="NEQUI">Nequi</option>
              <option value="DAVIPLATA">Daviplata</option>
            </select>
          </div>
        </div>

        <div v-if="reportStore.loading" class="loading-state card-modern">
          <div class="spinner"></div>
          <p>Generando Libro Diario Financiero de la academia...</p>
        </div>

        <div v-else-if="!reportStore.movementsReport.movements || reportStore.movementsReport.movements.length === 0" class="empty-state card-modern">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3>No existen movimientos.</h3>
          <p>No se han registrado movimientos financieros con los filtros aplicados.</p>
        </div>

        <div v-else class="table-card card-modern">
          <div class="table-responsive" id="movements-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Consecutivo</th>
                  <th>Tipo</th>
                  <th>Concepto / Periodo</th>
                  <th>Alumno</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th>Valor</th>
                  <th>Registrado Por</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in reportStore.movementsReport.movements" :key="m.id">
                  <td class="font-mono font-bold text-primary">{{ m.consecutive }}</td>
                  <td>
                    <span :class="['badge', m.type === 'INSCRIPCION' ? 'badge-primary' : 'badge-success']">
                      {{ m.type }}
                    </span>
                  </td>
                  <td class="font-semibold">{{ m.concept }}</td>
                  <td>{{ m.studentName }}</td>
                  <td><span class="category-pill">{{ m.categoryName }}</span></td>
                  <td>{{ formatDate(m.paymentDate) }}</td>
                  <td><span class="method-tag">{{ formatMethod(m.paymentMethod) }}</span></td>
                  <td class="font-bold text-dark">{{ formatCurrency(m.amount) }}</td>
                  <td class="text-sm text-muted">{{ m.registeredBy || 'Administrador' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- MODAL REPORTE INDIVIDUAL DE ALUMNO -->
    <StudentReportModal
      :show="showStudentModal"
      :report-data="reportStore.selectedStudentReport"
      @close="showStudentModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import KpiCard from '../../../components/ui/KpiCard.vue';
import { useReportStore } from '../../../stores/reportStore';
import { useStudentStore } from '../../../stores/studentStore';
import { exportToExcel, exportToPdf, printReport } from '../../../utils/exportUtils';
import StudentReportModal from '../components/StudentReportModal.vue';

const route = useRoute();
const reportStore = useReportStore();
const studentStore = useStudentStore();

const showStudentModal = ref(false);

const activeTab = computed(() => reportStore.activeTab);
const categoriesList = computed(() => studentStore.categories);

const monthHeaders = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const currentY = new Date().getFullYear();
const availableYears = [currentY - 1, currentY, currentY + 1];

// Filtros para cada reporte
const filters = reactive({
  students: { search: '', categoryId: '', status: '', gender: '' },
  monthly: { search: '', categoryId: '', year: currentY },
  debtors: { search: '', categoryId: '' },
  income: { period: 'month', startDate: '', endDate: '' },
  registrations: { search: '', paymentMethod: 'ALL' },
  movements: { search: '', type: 'ALL', paymentMethod: 'ALL' }
});

const tabs = [
  { id: 'students', label: '👥 Alumnos', icon: '' },
  { id: 'monthly', label: '💰 Mensualidades', icon: '' },
  { id: 'debtors', label: '🚨 Morosos', icon: '', badgeClass: 'tab-alert' },
  { id: 'income', label: '📈 Ingresos', icon: '' },
  { id: 'categories', label: '🏆 Categorías', icon: '' },
  { id: 'registrations', label: '📝 Inscripciones', icon: '' },
  { id: 'movements', label: '📚 Movimientos', icon: '' }
];

const hasDataToExport = computed(() => true);

const switchTab = (tabId) => {
  reportStore.setActiveTab(tabId);
  loadReportForCurrentTab();
};

const loadReportForCurrentTab = async () => {
  const current = reportStore.activeTab;
  if (current === 'students') await loadStudentsReport();
  else if (current === 'monthly') await loadMonthlyReport();
  else if (current === 'debtors') await loadDebtorsReport();
  else if (current === 'income') await loadIncomeReport();
  else if (current === 'categories') await reportStore.fetchCategoriesReport();
  else if (current === 'registrations') await loadRegistrationsReport();
  else if (current === 'movements') await loadMovementsReport();
};

const loadStudentsReport = async () => {
  await reportStore.fetchStudentsReport(filters.students);
};

const loadMonthlyReport = async () => {
  await reportStore.fetchMonthlyReport(filters.monthly);
};

const loadDebtorsReport = async () => {
  await reportStore.fetchDebtorsReport(filters.debtors);
};

const loadIncomeReport = async () => {
  await reportStore.fetchIncomeReport(filters.income);
};

const loadRegistrationsReport = async () => {
  await reportStore.fetchRegistrationsReport(filters.registrations);
};

const loadMovementsReport = async () => {
  await reportStore.fetchMovementsReport(filters.movements);
};

const viewStudentReport = async (studentId) => {
  await reportStore.fetchStudentIndividualReport(studentId);
  showStudentModal.value = true;
};

// Debouncers de Búsqueda
let timeoutS = null;
const debounceStudents = () => { clearTimeout(timeoutS); timeoutS = setTimeout(loadStudentsReport, 350); };
let timeoutM = null;
const debounceMonthly = () => { clearTimeout(timeoutM); timeoutM = setTimeout(loadMonthlyReport, 350); };
let timeoutD = null;
const debounceDebtors = () => { clearTimeout(timeoutD); timeoutD = setTimeout(loadDebtorsReport, 350); };
let timeoutR = null;
const debounceRegistrations = () => { clearTimeout(timeoutR); timeoutR = setTimeout(loadRegistrationsReport, 350); };
let timeoutMov = null;
const debounceMovements = () => { clearTimeout(timeoutMov); timeoutMov = setTimeout(loadMovementsReport, 350); };

// Manejadores de Exportación Excel / PDF / Impresión
const handleExcelExport = () => {
  const current = reportStore.activeTab;
  if (current === 'students') {
    const cols = [
      { key: 'code', label: 'Código' },
      { key: 'fullName', label: 'Nombre Completo' },
      { key: 'document', label: 'Documento' },
      { key: 'categoryName', label: 'Categoría' },
      { key: 'age', label: 'Edad' },
      { key: 'gender', label: 'Sexo' },
      { key: 'status', label: 'Estado' },
      { key: 'guardianName', label: 'Acudiente' },
      { key: 'guardianPhone', label: 'Teléfono Acudiente' }
    ];
    exportToExcel('Reporte_Alumnos', 'Reporte General de Alumnos', cols, reportStore.studentsReport.data);
  } else if (current === 'debtors') {
    const cols = [
      { key: 'code', label: 'Código' },
      { key: 'fullName', label: 'Alumno' },
      { key: 'document', label: 'Documento' },
      { key: 'categoryName', label: 'Categoría' },
      { key: 'guardianName', label: 'Acudiente' },
      { key: 'guardianPhone', label: 'Teléfono' },
      { key: 'pendingMonthsCount', label: 'Meses Mora' },
      { key: 'totalPending', label: 'Valor Pendiente (COP)' }
    ];
    exportToExcel('Reporte_Morosos', 'Reporte de Alumnos Morosos', cols, reportStore.debtorsReport.debtors);
  } else if (current === 'categories') {
    const cols = [
      { key: 'name', label: 'Categoría' },
      { key: 'totalStudents', label: 'Total Alumnos' },
      { key: 'activeStudents', label: 'Activos' },
      { key: 'inactiveStudents', label: 'Inactivos' },
      { key: 'expectedMonthlyIncome', label: 'Esperado (COP)' },
      { key: 'collectedThisMonth', label: 'Recaudado (COP)' },
      { key: 'collectionPercentage', label: '% Recaudo' }
    ];
    exportToExcel('Reporte_Categorias', 'Reporte por Categorías', cols, reportStore.categoriesReport.categories);
  } else if (current === 'registrations') {
    const cols = [
      { key: 'consecutive', label: 'Consecutivo' },
      { key: 'studentName', label: 'Alumno' },
      { key: 'studentDocument', label: 'Documento' },
      { key: 'categoryName', label: 'Categoría' },
      { key: 'paymentDate', label: 'Fecha' },
      { key: 'paymentMethod', label: 'Método' },
      { key: 'amount', label: 'Valor (COP)' },
      { key: 'notes', label: 'Notas' }
    ];
    exportToExcel('Reporte_Inscripciones', 'Reporte de Inscripciones', cols, reportStore.registrationsReport.registrations);
  } else if (current === 'movements') {
    const cols = [
      { key: 'consecutive', label: 'Consecutivo' },
      { key: 'type', label: 'Tipo' },
      { key: 'concept', label: 'Concepto' },
      { key: 'studentName', label: 'Alumno' },
      { key: 'categoryName', label: 'Categoría' },
      { key: 'paymentDate', label: 'Fecha' },
      { key: 'paymentMethod', label: 'Método' },
      { key: 'amount', label: 'Valor (COP)' }
    ];
    exportToExcel('Libro_Diario_Movimientos', 'Reporte General de Movimientos', cols, reportStore.movementsReport.movements);
  } else {
    alert('Exportación disponible en las pestañas de tablas detalladas.');
  }
};

const handlePrint = () => {
  const current = reportStore.activeTab;
  const targetId = `${current}-table-container`;
  const container = document.getElementById(targetId);

  let title = 'Reporte de la Academia';
  if (current === 'students') title = 'Reporte General de Alumnos';
  else if (current === 'monthly') title = `Matriz de Mensualidades - Año ${filters.monthly.year}`;
  else if (current === 'debtors') title = 'Reporte de Alumnos Morosos';
  else if (current === 'income') title = 'Reporte de Ingresos Financieros';
  else if (current === 'categories') title = 'Reporte Operativo por Categorías';
  else if (current === 'registrations') title = 'Reporte de Inscripciones y Matrículas';
  else if (current === 'movements') title = 'Libro Diario de Movimientos Financieros';

  if (container) {
    printReport(title, container.innerHTML);
  } else {
    alert('No se pudo preparar la impresión para este reporte.');
  }
};

const handlePdfExport = () => {
  handlePrint();
};

onMounted(async () => {
  await studentStore.fetchCategories();

  // Revisar si la ruta incluye el parámetro ?tab=...
  if (route.query.tab) {
    reportStore.setActiveTab(route.query.tab);
  }

  loadReportForCurrentTab();
});

watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    reportStore.setActiveTab(newTab);
    loadReportForCurrentTab();
  }
});

// Helpers de Formato
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$ 0';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
};

const formatDate = (dStr) => {
  if (!dStr) return '-';
  const d = new Date(dStr);
  if (isNaN(d.getTime())) return dStr;
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
};

const formatMethod = (method) => {
  if (!method) return 'Efectivo';
  const map = { EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', NEQUI: 'Nequi', DAVIPLATA: 'Daviplata', OTRO: 'Otro' };
  return map[method] || method;
};

const getMatrixCellIcon = (status) => {
  if (status === 'PAID') return '🟢';
  if (status === 'PENDING') return '🟡';
  if (status === 'OVERDUE') return '🔴';
  return '🔵';
};

const getMatrixCellClass = (status) => {
  return status.toLowerCase();
};

const getPercentageStr = (amount, total) => {
  if (!total || !amount) return '0%';
  const pct = Math.min(100, Math.round((amount / total) * 100));
  return `${pct}%`;
};
</script>

<style scoped>
.reports-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-dark);
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-gray-500);
}

.header-export-actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-excel {
  background-color: #107C41;
  color: var(--color-white);
}

.btn-excel:hover {
  background-color: #0B5C30;
}

.btn-pdf {
  background-color: #E11D48;
  color: var(--color-white);
}

.btn-pdf:hover {
  background-color: #BE123C;
}

.btn-print {
  background-color: var(--color-gray-700);
  color: var(--color-white);
}

.btn-print:hover {
  background-color: var(--color-dark);
}

/* Tabs Bar */
.tabs-nav-bar {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  padding: 0.5rem;
  gap: 0.35rem;
}

.tab-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-gray-600);
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-fast);
}

.tab-nav-btn:hover {
  background-color: var(--color-gray-100);
  color: var(--color-primary);
}

.tab-nav-btn.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.tab-nav-btn.tab-alert.active {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.tab-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-card {
  padding: 1.1rem 1.25rem;
}

.filters-grid-4 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.85rem;
}

.filters-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.85rem;
}

.filters-grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.85rem;
}

.filters-flex {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-gray-600);
}

.form-control {
  padding: 0.6rem 0.85rem;
  font-size: 0.88rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
}

.form-control:focus {
  border-color: var(--color-primary);
}

.loading-state, .empty-state {
  padding: 3.5rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon-success {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-success-bg);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-summary-header {
  display: flex;
  gap: 1.5rem;
  font-size: 0.88rem;
  background-color: var(--color-gray-100);
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-md);
  flex-wrap: wrap;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
}

.data-table th {
  padding: 0.8rem 0.9rem;
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
  font-weight: 700;
  border-bottom: 2px solid var(--color-gray-200);
  white-space: nowrap;
}

.data-table td {
  padding: 0.8rem 0.9rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-primary { color: var(--color-primary); }
.text-success { color: var(--color-success); }
.text-danger { color: var(--color-danger); }
.text-muted { color: var(--color-gray-500); }
.text-center { text-align: center; }

.category-pill {
  font-size: 0.76rem;
  padding: 0.2rem 0.55rem;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--border-radius-full);
  font-weight: 600;
}

.method-tag {
  font-size: 0.78rem;
  padding: 0.2rem 0.5rem;
  background-color: var(--color-gray-100);
  border-radius: var(--border-radius-md);
  font-weight: 600;
}

.btn-action-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
}

.btn-action-sm:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

/* Matriz */
.matrix-legend-bar {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: var(--color-gray-600);
  margin-bottom: 0.5rem;
}

.matrix-table th, .matrix-table td {
  padding: 0.65rem 0.5rem;
}

.matrix-cell-badge {
  display: inline-block;
  font-size: 1rem;
  cursor: help;
}

/* Morosos KPIs */
.debtors-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.debtors-kpi-card {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.alert-card-danger {
  border-left: 4px solid var(--color-danger);
  background-color: #FEF2F2;
}

.kpi-icon-danger {
  color: var(--color-danger);
}

.kpi-title-danger {
  font-size: 0.8rem;
  font-weight: 700;
  color: #991B1B;
  text-transform: uppercase;
}

.kpi-value-danger {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-danger);
  margin: 0.2rem 0;
}

.alert-card-warning {
  border-left: 4px solid var(--color-warning);
  background-color: #FFFBEB;
}

.kpi-title-warning {
  font-size: 0.8rem;
  font-weight: 700;
  color: #92400E;
  text-transform: uppercase;
}

.kpi-value-warning {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-warning);
  margin: 0.2rem 0;
}

.kpi-title-muted {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-gray-500);
  text-transform: uppercase;
}

.kpi-value-success {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-success);
  margin: 0.2rem 0;
}

.kpi-subtext {
  font-size: 0.78rem;
  color: var(--color-gray-500);
}

.last-pay-info {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
}

/* Income breakdown */
.income-kpis-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

@media (max-width: 1024px) {
  .income-kpis-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .income-kpis-grid {
    grid-template-columns: 1fr;
  }
}

.income-breakdown-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .income-breakdown-grid {
    grid-template-columns: 1fr;
  }
}

.income-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.income-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-dark);
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.item-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.progress-bar-bg {
  width: 100%;
  height: 10px;
  background-color: var(--color-gray-200);
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: var(--border-radius-full);
  transition: width 0.5s ease;
}

.progress-bar-fill.green { background-color: var(--color-success); }
.progress-bar-fill.blue { background-color: var(--color-primary); }
.progress-bar-fill.purple { background-color: #9333EA; }

.total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid var(--color-gray-200);
}

.text-xl {
  font-size: 1.3rem;
}

.badge-percentage-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notes-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-gray-500);
}
</style>
