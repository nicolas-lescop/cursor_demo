import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditPromptModal } from './EditPromptModal'
import { vi } from 'vitest'

// Mock icons
vi.mock('lucide-react', () => ({
    Pencil: () => <div data-testid="pencil-icon" />,
    Maximize2: () => <div data-testid="maximize-icon" />,
    Minimize2: () => <div data-testid="minimize-icon" />,
    X: () => <div data-testid="x-icon" />,
}))

const mockPrompt = {
    id: 1,
    title: 'Original Title',
    content: 'Original Content',
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
}

describe('EditPromptModal', () => {
    it('renders the trigger button correctly', () => {
        render(<EditPromptModal prompt={mockPrompt} onSubmit={async () => { }} />)
        expect(screen.getByTestId('pencil-icon')).toBeInTheDocument()
    })

    it('opens modal with pre-filled data when trigger is clicked', () => {
        render(<EditPromptModal prompt={mockPrompt} onSubmit={async () => { }} />)
        const trigger = screen.getByTestId('pencil-icon').closest('button')!
        fireEvent.click(trigger)

        expect(screen.getByText('Modifier le prompt')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument()
        expect(screen.queryByText('Original Content')).toBeInTheDocument()
    })

    it('calls onSubmit with updated data', async () => {
        const mockSubmit = vi.fn().mockResolvedValue(undefined)
        render(<EditPromptModal prompt={mockPrompt} onSubmit={mockSubmit} />)

        // Open modal
        fireEvent.click(screen.getByTestId('pencil-icon').closest('button')!)

        // Update form
        fireEvent.change(screen.getByLabelText('Nom du prompt'), { target: { value: 'Updated Title' } })
        fireEvent.change(screen.getByLabelText('Contenu du prompt'), { target: { value: 'Updated Content' } })
        fireEvent.click(screen.getByLabelText('Marquer comme favori'))

        // Submit
        const submitButton = screen.getByRole('button', { name: 'Enregistrer' })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith(1, {
                title: 'Updated Title',
                content: 'Updated Content',
                isFavorite: true,
            })
        })
    })
})
