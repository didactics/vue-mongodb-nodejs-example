/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

test = (st) => {
  console.log(st);
};

Vue.component('client-form', {
  template: `
    // back ticks in the form template get in the way of the JS parser, so the form markup
    // was duplicated in the 2 modals; an external .vue template is needed otherwise
  `,
});

window.app = new Vue({
  el: '#app',

  data: {

    fields: [
      { key: 'name', sortable: true },
      'email',
      { key: 'phone', sortable: true, formatter: 'formatPhone' },
      { key: 'providers', formatter: 'formatProviders' },
      { key: 'actions', label: '' },
    ],

    newClientDialogVisible: false,
    editClientDialogVisible: false,
    newProviderVisible: false,
    newProviderName: '',
    selectedProviders: [],
    clientFilter: '',
    validatorActive: false,
    clientDeleting: false,

    model: {
      clientId: '',
      providersStr: '',

      clients: [], // [{ _id, name, email, phone, providers: [{id: int}] }]
      providers: [], // [{ _id, id, name, editing, deleting, newName}]
      idToNameMap: undefined, // int -> String

      client: {
        name: '',
        email: '',
        phone: '',
        providers: [],
      },

      provider: {
        id: 0,
        name: '',
      },

      clearClient() {
        this.setClient(undefined, '', '', '', []);
      },

      clearProvider() {
        this.setProvider(0, '');
      },

      clearProvidersReactiveFields() {
        // Clean v-model-related fields of providers (reactively closes the form collapses)
        this.providers.forEach((p, index) => {
          this.providers[index].editing = false;
          this.providers[index].deleting = false;
          this.providers[index].newName = '';
        });
      },

      setClient(_id, name, email, phone, providers) {
        this.clientId = _id;
        this.client.name = name;
        this.client.email = email;
        this.client.phone = phone;
        this.client.providers = providers;
      },

      setProvider(id, name) {
        this.provider.id = id;
        this.provider.name = name;
        return this.provider;
      },

      setClients(response) {
        this.clients = response.data;
      },

      setProviders(response) {
        this.providers = response.data;

        // Sort providers by id
        this.providers.sort((p1, p2) => p1.id - p2.id); // > 0, 0, < 0

        // Provider name lookup
        this.idToNameMap = new Map();
        this.providers.forEach((p) => {
          this.idToNameMap.set(p.id, p.name);
        });

        // Add reactive props
        this.providers.forEach((p) => {
          Vue.set(p, 'editing', false);
          Vue.set(p, 'deleting', false);
          Vue.set(p, 'newName', '');
        });
      },

      formProvidersStr(client) {
        const names = client.providers.map((ref) => {
          if (!this.idToNameMap) return null;

          const name = this.idToNameMap.get(ref.id);
          return name;
        });

        return names.join(', ');
      },

      generateProviderId() {
        let max = -1;
        this.idToNameMap.forEach((val, key) => {
          if (max < key) max = key;
        });
        return max + 1;
      },

    }, // model

    api: {
      loadClients() {
        return axios.get('/api/clients');
      },

      loadProviders() {
        return axios.get('/api/providers');
      },

      storeClient(client, _id) {
        if (_id) {
          // Updating an existing client
          return axios.put(`/api/clients/${_id}`, client);
        }
        // Adding a client
        return axios.post('/api/clients', client);
      },

      storeProvider(provider, id) {
        if (id) {
          // Updating an existing provider
          return axios.put(`/api/providers/${id}`, provider);
        }

        // Adding a provider
        return axios.post('/api/providers', provider);
      },

      deleteClient(_id) {
        return axios.delete(`/api/clients/${_id}`);
      },

      deleteProvider(providerId) {
        return axios.delete(`/api/providers/${providerId}`);
      },

      deleteProviderRefs(providerId) {
        return axios.delete(`/api/clients/refs/${providerId}`);
      },

    },
  }, // api

  methods: {
    test(st) {
      console.log(st);
    },

    rowClicked(item) {
      // When <Edit Client> is clicked, this event is fired after the click
      this.model.setClient(item._id, item.name, item.email, item.phone, item.providers);
      this.selectedProviders = this.model.client.providers.map(ref => ref.id);
    },

    formatPhone(phoneSt) {
      // "1111111111" -> "111-111-1111";
      // Strip of no-digits and limit to 10 chars
      const cleaned = phoneSt.replace(/\D/g, '').substring(0, 10);

      const match = cleaned.match(/^(\d{3})(\d{1,3})?(\d{1,4})?$/);
      if (match) {
        if (match[3]) {
          return `${match[1]}-${match[2]}-${match[3]}`;
        }
        if (match[2]) {
          return `${match[1]}-${match[2]}`;
        }
      }
      return cleaned;
    },

    unformatPhone(phoneSt) {
      // "111-111-1111" -> "1111111111";
      return phoneSt.replace(/-/g, '').substring(0, 10);
    },

    formatProviders(value, key, client) {
      return this.model.formProvidersStr(client);
    },

    focusRef(ref) {
      // https://bootstrap-vue.js.org/docs/components/popover/
      /* Some references may be a component, functional component, or plain element */
      /* This handles that check before focusing, assuming a focus() method exists */
      /* We do this in a double nextTick to ensure components have updated & popover */
      /* positioned first */
      this.$nextTick(() => {
        this.$nextTick(() => {
          (ref.$el || ref).focus();
        });
      });
    },

    focusArrayRef(refSt) {
      const arr = this.$refs[refSt];
      this.focusRef(arr[0]);
    },

    resetClientForm() {
      this.newProviderVisible = false;
      this.newProviderName = '';
      this.validatorActive = false;
      this.clientDeleting = false;
      this.model.clearProvidersReactiveFields();
    },

    showNewClientDialog() {
      this.resetClientForm();
      this.model.clearClient();
      this.selectedProviders = [];
      this.newClientDialogVisible = true;
    },

    showEditClientDialog() {
      this.resetClientForm();
      this.editClientDialogVisible = true;
    },

    addClient(event) {
      // Block the form from closing while validated
      event.preventDefault();

      this.validatorActive = true;

      if (this.nameState && this.emailState) {
        this.api.storeClient(this.model.client)
          .then(() => {
            this.updateModel();
            this.model.clearClient();
          })
          .catch((error) => {
            console.log(error);
          });

        this.$refs.newClientDialog.hide();
      }
    },

    updateClient(event) {
      // Block the form from closing while validated
      event.preventDefault();
      this.validatorActive = true;

      if (this.nameState && this.emailState) {
        this.api.storeClient(this.model.client, this.model.clientId)
          .then(() => {
            this.updateModel();
            this.model.clearClient();
          })
          .catch((error) => {
            console.log(error);
          });

        this.$refs.editClientDialog.hide();
      }
    },

    addProvider() {
      this.model.setProvider(this.model.generateProviderId(), this.newProviderName);
      this.api.storeProvider(this.model.provider)
        .then(() => {
          this.updateModel();
          this.model.clearProvider();
          this.newProviderName = '';
          this.newProviderVisible = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    updateProvider(provider) {
      this.model.setProvider(provider.id, provider.newName);
      this.api.storeProvider(this.model.provider, provider.id)
        .then(() => {
          this.updateModel();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    deleteClient(clientId) {
      this.api.deleteClient(clientId)
        .then(() => {
          this.updateModel();
          this.model.clearClient();
          this.editClientDialogVisible = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    deleteProvider(providerId) {
      this.api.deleteProvider(providerId)
        .then(this.api.deleteProviderRefs(providerId))
        .then(this.updateModel())
        .catch((error) => {
          console.log(error);
        });
    },

    updateModel() {
      this.api.loadProviders()
        .then((response) => {
          this.model.setProviders(response);
          return this.api.loadClients();
        })
        .then((response) => {
          this.model.setClients(response);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    validateEmail(email) {
      // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(email);
    },

  }, // methods

  computed: {
    clientPhone: {
      get() {
        return this.formatPhone(this.model.client.phone);
      },

      set(newVal) {
        this.model.client.phone = this.unformatPhone(newVal);
      },
    },

    nameState() {
      const text = this.model.client.name;

      if (this.validatorActive) {
        return text.length >= 4;
      }
      return undefined;
    },

    nameInvalidFeedback() {
      const text = this.model.client.name;

      if (this.validatorActive) {
        if (text.length > 0) {
          return 'Enter at least 4 characters';
        }
        return 'Please enter a name';
      }
      return '';
    },

    emailState() {
      const text = this.model.client.email;

      if (this.validatorActive) {
        return this.validateEmail(text);
      }
      return undefined;
    },

    emailInvalidFeedback() {
      const text = this.model.client.email;

      if (this.validatorActive) {
        if (text.length > 0) {
          return (text.indexOf('@') === -1) ? '@ is missing in email' : 'Invalid email format';
        }
        return 'Please enter an email';
      }
      return '';
    },

  }, // computed

  watch: {
    selectedProviders(val) {
      // [string] -> [int]
      const intArr = val.map(stRef => parseInt(stRef, 10)).sort();

      // Update model
      // [int] -> [{id: int}]
      this.model.client.providers = intArr.map(intRef => ({ id: intRef }));

      // Update UI
      this.model.providersStr = this.model.formProvidersStr(this.model.client);
    },

  },

  // Lifespan hooks
  mounted() {
    this.updateModel();
  },

});
