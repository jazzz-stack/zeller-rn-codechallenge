import {gql} from '@apollo/client';

export const listZellerCustomers = gql`
  query ListZellerCustomers {
    listZellerCustomers {
      items {
        id
        name
        email
        role
      }
      nextToken
    }
  }
`;

export const getZellerCustomer = gql`
  query GetZellerCustomer($id: ID!) {
    getZellerCustomer(id: $id) {
      id
      name
      email
      role
    }
  }
`;
