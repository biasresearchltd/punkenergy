import React from 'react'
import { render } from '@testing-library/react'

const customRender = (ui, options) => render(ui, options)

export { customRender as render }
