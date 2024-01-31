<template>
  <Card>
    <template v-slot:header>
      <h3>{{ $t('userList.header') }}</h3>
    </template>  
      <template v-slot:default>
        <ul class="list-group list-group-flush">
          <UserItem v-for="user in pageData.content" :user="user" :key="user.id" />
        </ul>
      </template>
      <template v-slot:footer>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <button @click="loadData(pageData.page+1)" v-if="pageData.page+1 != pageData.totalPages" class="btn btn-outline-primary btn-sm">Next</button>
        <span v-if="apiProcessing" role="status" class="spinner-border spinner-border-sm"></span>
        <button  @click="loadData(pageData.page-1)" v-if="pageData.page != 0" class="btn btn-outline-primary btn-sm">Previous</button>
      </div>
    </template>
  </Card>
  </template>

<script setup>
import Card from "@/components/Card.vue";
import http from "@/lib/http";
import UserItem from "./UserItem.vue";
import { onMounted, reactive, ref } from "vue";

const pageData = reactive({
  content: [],
  page: 0,
  size: 0,
  totalPages: 0
})

const apiProcessing = ref(false);

onMounted(async() => {
    loadData();
})

const loadData = async(pageNumber = 0) => {

    apiProcessing.value = true;
    
    const {
    data: { content, page, size, totalPages }
  } = await http.get('/api/v1/users',{params:{page:pageNumber,size:3}})

  apiProcessing.value = false;
  pageData.content = content;
  pageData.size = size;
  pageData.page = page;
  pageData.totalPages = totalPages
}

</script>