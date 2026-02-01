{{/*
Expand the name of the chart.
*/}}
{{- define "oms-nest.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "oms-nest.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "oms-nest.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "oms-nest.labels" -}}
helm.sh/chart: {{ include "oms-nest.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: oms-nest
environment: {{ .Values.global.environment }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "oms-nest.backend.labels" -}}
{{ include "oms-nest.labels" . }}
app.kubernetes.io/name: {{ include "oms-nest.fullname" . }}-backend
app.kubernetes.io/component: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "oms-nest.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "oms-nest.fullname" . }}-backend
app.kubernetes.io/component: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "oms-nest.frontend.labels" -}}
{{ include "oms-nest.labels" . }}
app.kubernetes.io/name: {{ include "oms-nest.fullname" . }}-frontend
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "oms-nest.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "oms-nest.fullname" . }}-frontend
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Redis labels
*/}}
{{- define "oms-nest.redis.labels" -}}
{{ include "oms-nest.labels" . }}
app.kubernetes.io/name: {{ include "oms-nest.fullname" . }}-redis
app.kubernetes.io/component: redis
{{- end }}

{{/*
Redis selector labels
*/}}
{{- define "oms-nest.redis.selectorLabels" -}}
app.kubernetes.io/name: {{ include "oms-nest.fullname" . }}-redis
app.kubernetes.io/component: redis
{{- end }}

{{/*
Backend image
*/}}
{{- define "oms-nest.backend.image" -}}
{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}
{{- end }}

{{/*
Frontend image
*/}}
{{- define "oms-nest.frontend.image" -}}
{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}
{{- end }}

{{/*
Redis service name
*/}}
{{- define "oms-nest.redis.serviceName" -}}
{{ include "oms-nest.fullname" . }}-redis
{{- end }}

{{/*
Maildev labels
*/}}
{{- define "oms-nest.maildev.labels" -}}
{{ include "oms-nest.labels" . }}
app.kubernetes.io/name: {{ include "oms-nest.fullname" . }}-maildev
app.kubernetes.io/component: maildev
{{- end }}

{{/*
Maildev selector labels
*/}}
{{- define "oms-nest.maildev.selectorLabels" -}}
app.kubernetes.io/name: {{ include "oms-nest.fullname" . }}-maildev
app.kubernetes.io/component: maildev
{{- end }}

{{/*
Maildev service name
*/}}
{{- define "oms-nest.maildev.serviceName" -}}
{{ include "oms-nest.fullname" . }}-maildev
{{- end }}
