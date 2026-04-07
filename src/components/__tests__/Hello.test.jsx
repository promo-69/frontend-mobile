import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Hello from '../Hello';

describe('Hello component', () => {
  it('Debe renderizar el texto correctamdente', () => {
    render(<Hello />);
    expect(screen.getByText('Hello!')).toBeTruthy();
  });
});
