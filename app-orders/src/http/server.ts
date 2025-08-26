import '@opentelemetry/auto-instrumentations-node/register'

import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { z } from 'zod'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { db } from '../db/client.ts'
import { schema } from '../db/schema/index.ts'
import { randomUUID } from 'node:crypto'
import { dispatchOrderCreated } from '../broker/messages/order-created.ts'
import { trace } from '@opentelemetry/api'
import { setTimeout } from 'node:timers/promises'
import { tracer } from '../tracer/tracer.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, {
  origin: '*'
})

app.get('/health', () => {
  return 'OK'
})

app.post('/orders', {
  schema: {
    body: z.object({
      amount: z.coerce.number(),
    })
  }
}, async (request, reply) => {
  const { amount } = request.body

  console.log('Creating order with amount:', amount)

  const orderId = randomUUID()

  await db.insert(schema.orders).values({
    id: randomUUID(),
    customerId: 'sfa564f65as4f56sa4f654as',
    amount,
  })

  const span = tracer.startSpan('acho que aqui está o problema')

  span.setAttribute('teste', 'Hello world')

  await setTimeout(2000)

  span.end()

  trace.getActiveSpan()?.setAttribute('order_id', orderId)

  dispatchOrderCreated({
    orderId,
    amount,
    customer: {
      id: 'sfa564f65as4f56sa4f654as'
    }
  })

  return reply.status(201).send()
})

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
  console.log('[Orders] HTTP Server running!')
})