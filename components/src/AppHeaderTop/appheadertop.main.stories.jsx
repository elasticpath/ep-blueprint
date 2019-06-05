import React from 'react';
import {storiesOf} from '@storybook/react';
import { MemoryRouter } from 'react-router';

const appHeaderTopLinks = {
  shippingreturns: '',
  aboutus: '',
  contactus: '',
};

storiesOf('AppHeaderTop', module)
  .addDecorator(story => (
    <MemoryRouter initialEntries={['/productdetails']}>{story()}</MemoryRouter>
  ))
  .add('AppHeaderTop', () => {
    return (
        <AppHeaderTop isMobileView={false} appHeaderTopLinks={appHeaderTopLinks}/>
  );
  });
