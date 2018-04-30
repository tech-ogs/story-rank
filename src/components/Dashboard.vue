<template>
<b-container class="bv-example-row">
  <b-row>
    <b-col>
      <img src="../assets/logo.png" class="tag-icon avatar">
    </b-col>
    <b-col></b-col>
    <b-col></b-col>
    <b-col></b-col>
  </b-row>
  <b-row>
    <b-col>
      <b-table striped :items="items">
        <template slot="submitter_id" slot-scope="data">
          {{ users != null ? ( users[data.item.submitter_id] != null ? users[data.item.submitter_id].name : 'x') : 'y'}}
        </template>
      </btable>
    </b-col>
  </b-row>
</b-container>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      submitters: this.users
    }
  },
  computed: {
    users() { return this.$store.getters.usersGetItems },
    items() { return this.$store.getters.storiesGetItems },
    users () { return this.$store.getters.usersGetIdMap },
    user() { return (id) => {
      return this.$store.getters.rowById('users', id) 
    }},
    name () { return (row) => { return row != null ? row.name : 'x' }}
  },
  mounted () { 
    this.$store.dispatch('initData')
    .then(() => {
      console.log('checking state stories', this.items)
      console.log('checking state users', this.users)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tag-icon {
  height: 50px;
  width: 50px;
}
</style>
