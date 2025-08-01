<template>
  <el-upload drag action="http://localhost:8000/parse" :on-success="onSuccess">
    <i class="el-icon-upload"></i>
    <div>拖拽或点击上传 PDF</div>
  </el-upload>

  <el-tabs v-if="result" v-model="activeTab">
    <el-tab-pane label="Markdown" name="md">
      <pre>{{ markdownText }}</pre>
    </el-tab-pane>
    <el-tab-pane label="Layout 图" name="layout">
      <img :src="layoutImage" style="width: 100%;" />
    </el-tab-pane>
    <el-tab-pane label="JSON" name="json">
      <pre>{{ jsonText }}</pre>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const result = ref(null)
const activeTab = ref('md')
const markdownText = ref('')
const jsonText = ref('')
const layoutImage = ref('')

const onSuccess = async (response) => {
  const path = response.output_path
  const mdFile = `${path}/${response.filename.replace('.pdf', '.md')}`
  const jsonFile = `${path}/middle.json`
  const layoutFile = `${path}/layout.pdf`

  markdownText.value = await axios.get(mdFile).then(res => res.data)
  jsonText.value = await axios.get(jsonFile).then(res => JSON.stringify(res.data, null, 2))
  layoutImage.value = layoutFile + '?t=' + Date.now()
  result.value = true
}
</script>