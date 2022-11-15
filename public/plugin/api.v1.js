// eslint-disable-next-line no-unused-vars
const api = {
  admin: {
    routeError: async () => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/admin/v1/route-error`;
        // eslint-disable-next-line no-undef
        const { data } = await axios.get(url, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'admin-route-error-browser-app',
          },
        });

        return data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
      return undefined;
    },
    audit: async () => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/admin/v1/audit`;
        // eslint-disable-next-line no-undef
        const { data } = await axios.get(url, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'admin-audit-history-browser-app',
          },
        });

        return data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
      return undefined;
    },
  },
  ai: {
    prompt: async (postData) => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/api/v1/ai/prompt`;
        // eslint-disable-next-line no-undef
        const { data } = await axios.post(url, postData, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'write-ai-prompt-browser-app',
          },
        });
        return data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        // alert(`${error.message}`);
      }
      return undefined;
    },
    code: async (postData) => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/api/v1/ai/code`;
        // eslint-disable-next-line no-undef
        const { data } = await axios.post(url, postData, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'build-code-browser-app',
          },
        });
        return data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
      return undefined;
    },
  },
  verify: {
    profile: async (user) => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/api/v1/verify`;
        // eslint-disable-next-line no-undef
        const { data } = await axios.post(url, user, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'user-web-profile',
          },
        });
        return data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
      return undefined;
    },
  },
  entity: {
    create: async (postData) => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/api/v1/entity`;
        // eslint-disable-next-line no-undef
        await axios.post(url, postData, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'save-prompt-browser-app',
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
      return undefined;
    },
    remove: async (entityId) => {
      const url = `${window.location.protocol}//${window.location.host}/api/v1/entity/${entityId}`;
      try {
        // eslint-disable-next-line no-undef
        await axios.delete(url, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'remove-entity-browser-app',
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
    },
    getAll: async () => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/api/v1/entity`;
        // eslint-disable-next-line no-undef
        const { data } = await axios.get(url, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'entity-get-all-browser-app',
          },
        });

        return data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
      return undefined;
    },
    getTagByName: async (tagName) => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/api/v1/entity/${tagName}`;
        // eslint-disable-next-line no-undef
        const { data } = await axios.get(url, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'completion-get-entity-by-tag-browser-app',
          },
        });

        return data.map(({ prompt }) => prompt).join('\n');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
        return '';
      }
    },
  },
  tag: {
    create: async (postData) => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/api/v1/tag`;
        // eslint-disable-next-line no-undef
        await axios.post(url, postData, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'tagged-prompts-browser-app',
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
      return undefined;
    },
    getAll: async () => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/api/v1/tag`;
        // eslint-disable-next-line no-undef
        const { data } = await axios.get(url, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'completions-get-all-tags-browser-app',
          },
        });

        return data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
      return undefined;
    },
    remove: async (slug) => {
      const url = `${window.location.protocol}//${window.location.host}/api/v1/tag/${slug}`;
      try {
        // eslint-disable-next-line no-undef
        const result = await axios.delete(url, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'remove-tag-browser-app',
          },
        });
        return result;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
        return false;
      }
    },
    getTagLocations: async () => {
      try {
        const url = `${window.location.protocol}//${window.location.host}/api/v1/tag/locate`;
        // eslint-disable-next-line no-undef
        const { data } = await axios.get(url, {
          headers: {
            // eslint-disable-next-line no-undef
            Authorization: `Bearer ${userAccessToken}`,
            'x-app-event': 'wiring-load-tag-locations-browser-app',
          },
        });

        return data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`${error.message}`);
      }
      return undefined;
    },
  },
};
