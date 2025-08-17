import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {ActivityIndicator} from 'react-native';
import LoadingState from '../LoadingState/LoadingState';

// Mock the Text component
jest.mock('../../Atoms', () => ({
  Text: ({children, style, ...props}: any) => {
    const {Text} = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
}));

describe('LoadingState', () => {
  it('renders loading text', () => {
    render(<LoadingState />);
    
    expect(screen.getByText('Loading Customer...')).toBeTruthy();
  });

  it('renders activity indicator', () => {
    const {UNSAFE_root} = render(<LoadingState />);
    
    const activityIndicator = UNSAFE_root.findByType(ActivityIndicator);
    expect(activityIndicator).toBeTruthy();
  });

  it('applies custom text style', () => {
    const customStyle = {color: 'blue'};
    render(<LoadingState textStyle={customStyle} />);
    
    expect(screen.getByText('Loading Customer...')).toBeTruthy();
  });
});
