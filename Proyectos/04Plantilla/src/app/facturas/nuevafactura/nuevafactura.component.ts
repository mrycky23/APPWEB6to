import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, Event, ActivatedRoute } from '@angular/router';
import { IFactura } from 'src/app/Interfaces/factura';
import { ICliente } from 'src/app/Interfaces/icliente';
import { ClientesService } from 'src/app/Services/clientes.service';
import { FacturaService } from 'src/app/Services/factura.service';

@Component({
  selector: 'app-nuevafactura',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './nuevafactura.component.html',
  styleUrl: './nuevafactura.component.scss'
})
export class NuevafacturaComponent implements OnInit {
  //variables o constantes
  titulo = 'Nueva Factura';
  idFactura = 0;  
  listaClientes: ICliente[] = [];
  listaClientesFiltrada: ICliente[] = [];
  totalapagar: number = 0;
  //formgroup
  frm_factura = new FormGroup({
    Fecha: new FormControl('', Validators.required),
    Sub_total: new FormControl('', Validators.required),
    Sub_total_iva: new FormControl('', Validators.required),
    Valor_IVA: new FormControl('0.15', Validators.required),
    Clientes_idClientes: new FormControl('', Validators.required)
  })

  ///////
  constructor(
    private clienteServicio: ClientesService,
    private facturaService: FacturaService,
    private navegacion: Router,
    private ruta: ActivatedRoute
  ) {}

  ngOnInit(): void {
  
  // Corrige el manejo de valores null
  const id = this.ruta.snapshot.paramMap.get('idFactura');
  this.idFactura = id ? parseInt(id) : 0;

  if (this.idFactura > 0) {
    this.facturaService.uno(this.idFactura).subscribe((unfactura) => {
      if (unfactura) {
        this.frm_factura.controls['Clientes_idClientes'].setValue(unfactura.Clientes_idClientes.toString());
        this.frm_factura.controls['Fecha'].setValue(unfactura.Fecha); 
        this.frm_factura.controls['Sub_total'].setValue(unfactura.Sub_total.toString());
        this.frm_factura.controls['Sub_total_iva'].setValue(unfactura.Sub_total_iva.toString());
        this.frm_factura.controls['Valor_IVA'].setValue(unfactura.Valor_IVA.toString());
        this.titulo = 'Editar Factura';
      }
    });
  }
  this.clienteServicio.todos().subscribe({
    next: (data) => {
      this.listaClientes = data;
      this.listaClientesFiltrada = data;
    },
    error: (e) => {
      console.log(e);
    }
  });
}

  grabar() {
    let factura: IFactura = {
      Fecha: this.frm_factura.get('Fecha')?.value,
      Sub_total: parseInt(this.frm_factura.get('Sub_total')?.value),
      Sub_total_iva: parseInt(this.frm_factura.get('Sub_total_iva')?.value),
      Valor_IVA: parseInt(this.frm_factura.get('Valor_IVA')?.value),
      Clientes_idClientes: parseInt(this.frm_factura.get('Clientes_idClientes')?.value)
    };

    this.facturaService.insertar(factura).subscribe((respuesta) => {
      if (parseInt(respuesta) > 0) {
        alert('Factura grabada');
        this.navegacion.navigate(['/facturas']);
      }
    });
  }
  calculos() {
    let sub_total = parseInt(this.frm_factura.get('Sub_total')?.value) ;
    let iva = parseInt(this.frm_factura.get('Valor_IVA')?.value);
    let sub_total_iva = sub_total * iva;
    this.frm_factura.get('Sub_total_iva')?.setValue(sub_total_iva.toString());
    this.totalapagar = sub_total + sub_total_iva;
  }

  cambio(objetoSleect: any) {
    let idCliente = objetoSleect.target.value;
    this.frm_factura.get('Clientes_idClientes')?.setValue(idCliente);
  }
}
