/**
 * Copyright © 2019 Elastic Path Software Inc. All rights reserved.
 *
 * This is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this license. If not, see
 *
 *     https://www.gnu.org/licenses/
 *
 *
 */

import React, { Component } from 'react';
import Modal from 'react-responsive-modal';
import { login } from '../utils/AuthService';
import { cortexFetch } from '../utils/Cortex';
import { getConfig, IEpConfig } from '../utils/ConfigProvider';
import PaymentFormMain from '../PaymentForm/paymentform.main';

import './paymentselector.main.less';

let Config: IEpConfig | any = {};
let intl = { get: str => str };

interface PaymentSelectorMainProps {
  /** handle payment method change */
  onChange: (...args: any[]) => any,
  /** disable add a new payment method */
  disableAddPayment?: boolean,
  /** Payment Instrument Selector json object */
  paymentInstrumentSelector: any,
  /** on Selection or Deletion error */
  onError?: any,
}
interface PaymentSelectorMainState {
    openNewPaymentModal: boolean,
    isLoading: boolean,
}
class PaymentSelectorMain extends Component<PaymentSelectorMainProps, PaymentSelectorMainState> {
  constructor(props) {
    super(props);
    this.state = {
      openNewPaymentModal: false,
      isLoading: false,
    };
    const epConfig = getConfig();
    Config = epConfig.config;
    ({ intl } = epConfig);
    this.handleCloseNewPaymentModal = this.handleCloseNewPaymentModal.bind(this);
    this.handlePaymentInstrumentSelection = this.handlePaymentInstrumentSelection.bind(this);
    this.renderPaymentMethods = this.renderPaymentMethods.bind(this);
  }

  handleDelete(link) {
    login().then(() => {
      cortexFetch(link, {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem(`${Config.cortexApi.scope}_oAuthToken`),
        },
      }).then(() => {
        const { onChange } = this.props;
        onChange();
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error.message);
      });
    });
  }

  handleCloseNewPaymentModal() {
    this.setState({ openNewPaymentModal: false });
  }

  newPayment() {
    this.setState({ openNewPaymentModal: true });
  }

  // eslint-disable-next-line class-methods-use-this
  getSortedChosenAndChoicePaymentInstrumentsAlphabetically(paymentInstrumentSelector) {
    const allPaymentInstruments = [...paymentInstrumentSelector._choice, { ...paymentInstrumentSelector._chosen[0], chosen: true }];
    return allPaymentInstruments.sort((paymentInstrumentA, paymentInstrumentB) => {
      const paymentInstrumentNameA = paymentInstrumentA._description[0].name;
      const paymentInstrumentNameB = paymentInstrumentB._description[0].name;
      return paymentInstrumentNameA.localeCompare(paymentInstrumentNameB);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async handlePaymentInstrumentSelection(selectAction, event) {
    const { onChange, onError } = this.props;

    this.setState({ isLoading: true });

    try {
      const res = await cortexFetch(`${selectAction}?followlocation=true`, 
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer 1d553c32-79d7-48c7-af7a-a95d00c1ecfa',
          },
        });

      if (res.status === 201) {
        onChange();
        this.setState({ isLoading: false });
      } else {
        this.setState({ isLoading: false });
        event.preventDefault();

        if (onError) {
          onError(res.statusText);
        }
      }
    } catch (err) {
      onError(err);
      event.preventDefault();
    }
  }

  renderPaymentMethods() {
    const { paymentInstrumentSelector } = this.props;

    if (paymentInstrumentSelector) {
      const sortedPaymentInstrumentSelectors = this.getSortedChosenAndChoicePaymentInstrumentsAlphabetically(paymentInstrumentSelector);

      return (
        sortedPaymentInstrumentSelectors.map((paymentInstrument) => {
          const displayName = paymentInstrument._description[0].name;
          const checked = paymentInstrument.chosen !== undefined;
          const selectAction = paymentInstrument.links[0].uri;
          const descriptionUri = paymentInstrument._description[0].self.uri;
          return (
            <ul key={`profile_payment_${Math.random().toString(36).substr(2, 9)}`} className="profile-payment-methods-listing">
              <li className="profile-payment-method-container">
                <div data-region="paymentMethodComponentRegion" className="profile-payment-method-label-container">
                  <input type="radio" name="billing" id="billingOption" className="checkout-address-radio" defaultChecked={checked} onClick={event => this.handlePaymentInstrumentSelection(selectAction, event)} />
                  <span data-el-value="payment.token" className="payment-instrument-name-container">
                    {displayName}
                  </span>
                </div>
                <button className="ep-btn small profile-delete-payment-btn" type="button" onClick={() => { this.handleDelete(descriptionUri); }}>
                  {intl.get('delete')}
                </button>
              </li>
            </ul>
          );
        })
      );
    }

    return null;
  }

  render() {
    const { openNewPaymentModal, isLoading } = this.state;
    const {
      onChange, disableAddPayment,
    } = this.props;

    return (
      <div className={`paymentMethodsRegions ${isLoading ? 'loading' : ''}`} data-region="paymentMethodsRegion" style={{ display: 'block' }}>
        <div>
          <h2>
            {intl.get('payment-methods')}
          </h2>
          {/* Overlay the loading on top of it.. */}
          { isLoading && <div className="miniLoader" /> }
          {this.renderPaymentMethods()}
          <button className="ep-btn primary wide new-payment-btn" type="button" disabled={disableAddPayment} onClick={() => { this.newPayment(); }}>
            {intl.get('add-new-payment-method')}
          </button>
          <div className={`${isLoading} ? 'miniLoader' : ''`} />
          <Modal open={openNewPaymentModal} onClose={this.handleCloseNewPaymentModal}>
            <div className="modal-lg new-payment-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">
                    {intl.get('new-payment-method')}
                  </h2>
                </div>
                <div className="modal-body">
                  <PaymentFormMain
                    defaultPostSelection
                    onCloseModal={this.handleCloseNewPaymentModal}
                    fetchData={onChange}
                  />
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

export default PaymentSelectorMain;