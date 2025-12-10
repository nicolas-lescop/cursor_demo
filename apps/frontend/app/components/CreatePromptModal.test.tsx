import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreatePromptModal } from './CreatePromptModal'
import { vi } from 'vitest'

// Mock icons
vi.mock('lucide-react', () => ({
    Plus: () => <div data-testid="plus-icon" />,
    Maximize2: () => <div data-testid="maximize-icon" />,
    Minimize2: () => <div data-testid="minimize-icon" />,
    X: () => <div data-testid="x-icon" />,
    Pencil: () => <div data-testid="pencil-icon" />,
    Search: () => <div data-testid="search-icon" />,
    Star: () => <div data-testid="star-icon" />,
}))

describe('CreatePromptModal', () => {
    it('renders the trigger button correctly', () => {
        render(<CreatePromptModal onSubmit={async () => { }} />)
        expect(screen.getByText('Nouveau Prompt')).toBeInTheDocument()
    })

    it('opens modal when trigger is clicked', () => {
        render(<CreatePromptModal onSubmit={async () => { }} />)
        const trigger = screen.getByText('Nouveau Prompt')
        fireEvent.click(trigger)

        expect(screen.getByText('Créer un nouveau prompt')).toBeInTheDocument()
        expect(screen.getByLabelText('Nom du prompt')).toBeInTheDocument()
        expect(screen.getByLabelText('Contenu du prompt')).toBeInTheDocument()
    })

    it('calls onSubmit with correct data when form is valid', async () => {
        const mockSubmit = vi.fn().mockResolvedValue(undefined)
        render(<CreatePromptModal onSubmit={mockSubmit} />)

        // Open modal
        fireEvent.click(screen.getByText('Nouveau Prompt'))

        // Fill form
        fireEvent.change(screen.getByLabelText('Nom du prompt'), { target: { value: 'Test Title' } })
        fireEvent.change(screen.getByLabelText('Contenu du prompt'), { target: { value: 'Test Content' } })

        // Submit
        const submitButton = screen.getByRole('button', { name: 'Créer le prompt' })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith({
                title: 'Test Title',
                content: 'Test Content',
            })
        })
    })

    it('disables submit button when fields are empty', () => {
        render(<CreatePromptModal onSubmit={async () => { }} />)
        fireEvent.click(screen.getByText('Nouveau Prompt'))

        const submitButton = screen.getByRole('button', { name: 'Créer le prompt' })
        expect(submitButton).toBeDisabled()
    })
})
