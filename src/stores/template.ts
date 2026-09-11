import { defineStore } from 'pinia'
import { DEFAULT_DESIGN_ID, DESIGNS, getDesign, type DesignId } from '@/data/designs'
import { DEFAULT_SIZE_ID, getSize } from '@/data/sizes'

export interface LabelOptions {
  showManufacturer: boolean
  showLine: boolean
  showStrength: boolean
  showProfile: boolean
  /** Линии реза вокруг наклеек на листе. */
  cutGuides: boolean
}

const STORAGE_KEY = 'stickah:template'

interface TemplateState {
  sizeId: string
  designId: DesignId
  options: LabelOptions
}

const DEFAULTS: TemplateState = {
  sizeId: DEFAULT_SIZE_ID,
  designId: DEFAULT_DESIGN_ID,
  options: {
    showManufacturer: true,
    showLine: true,
    showStrength: false,
    showProfile: false,
    cutGuides: true,
  },
}

function load(): TemplateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULTS)
    const parsed = JSON.parse(raw)
    const designId: DesignId = DESIGNS.some((d) => d.id === parsed.designId)
      ? parsed.designId
      : DEFAULTS.designId
    const sizeId = typeof parsed.sizeId === 'string' ? parsed.sizeId : DEFAULTS.sizeId
    return {
      sizeId: getDesign(designId).sizeId ?? sizeId,
      designId,
      options: { ...DEFAULTS.options, ...(parsed.options ?? {}) },
    }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

export const useTemplateStore = defineStore('template', {
  state: (): TemplateState => load(),

  getters: {
    size: (state) => getSize(state.sizeId),
    design: (state) => getDesign(state.designId),
  },

  actions: {
    setSize(id: string) {
      // Размер зафиксирован выбранным дизайном.
      if (this.design.sizeId) return
      this.sizeId = id
      this.persist()
    },
    setDesign(id: DesignId) {
      this.designId = id
      const fixedSizeId = getDesign(id).sizeId
      if (fixedSizeId) this.sizeId = fixedSizeId
      this.persist()
    },
    persist() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ sizeId: this.sizeId, designId: this.designId, options: this.options }),
        )
      } catch {
        /* noop */
      }
    },
  },
})
