import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GradeBar from './GradeBar';

describe('GradeBar', () => {
  it('renders exactly 4 grade buttons', () => {
    render(<GradeBar onGrade={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('renders buttons in order: Again, Hard, Good, Easy', () => {
    render(<GradeBar onGrade={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Again');
    expect(buttons[1]).toHaveTextContent('Hard');
    expect(buttons[2]).toHaveTextContent('Good');
    expect(buttons[3]).toHaveTextContent('Easy');
  });

  it('calls onGrade("AGAIN") when Again button is clicked', async () => {
    const onGrade = vi.fn();
    render(<GradeBar onGrade={onGrade} />);
    await userEvent.click(screen.getByText(/Again/i));
    expect(onGrade).toHaveBeenCalledWith('AGAIN');
  });

  it('calls onGrade("HARD") when Hard button is clicked', async () => {
    const onGrade = vi.fn();
    render(<GradeBar onGrade={onGrade} />);
    await userEvent.click(screen.getByText(/Hard/i));
    expect(onGrade).toHaveBeenCalledWith('HARD');
  });

  it('shows keyboard hints [1] through [4]', () => {
    render(<GradeBar onGrade={vi.fn()} />);
    expect(screen.getByText('[1]')).toBeInTheDocument();
    expect(screen.getByText('[2]')).toBeInTheDocument();
    expect(screen.getByText('[3]')).toBeInTheDocument();
    expect(screen.getByText('[4]')).toBeInTheDocument();
  });

  it('does not call onGrade when disabled', async () => {
    const onGrade = vi.fn();
    render(<GradeBar onGrade={onGrade} disabled />);
    await userEvent.click(screen.getByText(/Again/i));
    expect(onGrade).not.toHaveBeenCalled();
  });
});
